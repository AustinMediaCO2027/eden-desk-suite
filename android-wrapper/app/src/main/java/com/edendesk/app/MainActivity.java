package com.edendesk.app;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.net.http.SslError;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String HOME_URL = "https://eden-desk.com";
    private static final int FILE_CHOOSER_REQUEST = 4301;
    private static final int STORAGE_PERMISSION_REQUEST = 4302;

    private WebView webView;
    private ProgressBar progressBar;
    private ValueCallback<Uri[]> pendingFileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.WHITE);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        int progressHeight = Math.max(4, Math.round(4 * getResources().getDisplayMetrics().density));
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                progressHeight
        );
        progressParams.gravity = android.view.Gravity.TOP;
        root.addView(progressBar, progressParams);

        setContentView(root);
        configureWebView();

        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P
                && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(
                    new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                    STORAGE_PERMISSION_REQUEST
            );
        }

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(HOME_URL);
        }
    }

    private void configureWebView() {
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccess(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " EdenDeskAndroid/1.0");

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        webView.addJavascriptInterface(new AndroidDownloadBridge(), "AndroidDownloadBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return openUri(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openUri(Uri.parse(url));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                installBlobDownloadInterceptor();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    showOfflinePage();
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                Toast.makeText(MainActivity.this, "Secure connection failed.", Toast.LENGTH_LONG).show();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
                progressBar.setProgress(newProgress);
            }

            @Override
            public boolean onShowFileChooser(
                    WebView webView,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams
            ) {
                if (pendingFileCallback != null) {
                    pendingFileCallback.onReceiveValue(null);
                }
                pendingFileCallback = filePathCallback;

                Intent chooserIntent;
                try {
                    chooserIntent = fileChooserParams.createIntent();
                    chooserIntent.addCategory(Intent.CATEGORY_OPENABLE);
                    startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception exception) {
                    pendingFileCallback = null;
                    Toast.makeText(MainActivity.this, "Unable to open the file picker.", Toast.LENGTH_LONG).show();
                    return false;
                }
            }

            @Override
            public boolean onCreateWindow(
                    WebView view,
                    boolean isDialog,
                    boolean isUserGesture,
                    android.os.Message resultMsg
            ) {
                WebView popup = new WebView(MainActivity.this);
                popup.getSettings().setJavaScriptEnabled(true);
                popup.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView childView, WebResourceRequest request) {
                        webView.loadUrl(request.getUrl().toString());
                        return true;
                    }

                    @Override
                    public void onPageStarted(WebView childView, String url, android.graphics.Bitmap favicon) {
                        webView.loadUrl(url);
                        childView.destroy();
                    }
                });

                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup);
                resultMsg.sendToTarget();
                return true;
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            if (url != null && url.startsWith("blob:")) {
                downloadBlob(url, guessFileName(contentDisposition, mimeType));
                return;
            }
            enqueueHttpDownload(url, userAgent, contentDisposition, mimeType);
        });
    }

    private boolean openUri(Uri uri) {
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (scheme.equals("http") || scheme.equals("https")) {
            return false;
        }

        try {
            Intent intent;
            if (scheme.equals("intent")) {
                intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
            } else {
                intent = new Intent(Intent.ACTION_VIEW, uri);
            }
            startActivity(intent);
        } catch (Exception ignored) {
            Toast.makeText(this, "No application can open this link.", Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    private void installBlobDownloadInterceptor() {
        String script = "(function(){"
                + "if(window.__edenDeskDownloadBridgeInstalled)return;"
                + "window.__edenDeskDownloadBridgeInstalled=true;"
                + "document.addEventListener('click',function(event){"
                + "var node=event.target;while(node&&node.tagName!=='A'){node=node.parentElement;}"
                + "if(!node||!node.href||node.href.indexOf('blob:')!==0)return;"
                + "event.preventDefault();"
                + "fetch(node.href).then(function(r){return r.blob();}).then(function(blob){"
                + "var reader=new FileReader();reader.onloadend=function(){"
                + "var data=String(reader.result||'');var comma=data.indexOf(',');"
                + "AndroidDownloadBridge.saveBase64File(comma>=0?data.substring(comma+1):data,node.download||'eden-desk-document.pdf',blob.type||'application/pdf');"
                + "};reader.readAsDataURL(blob);"
                + "}).catch(function(){location.href=node.href;});"
                + "},true);"
                + "})();";
        webView.evaluateJavascript(script, null);
    }

    private void downloadBlob(String blobUrl, String fileName) {
        String escapedUrl = blobUrl.replace("'", "\\'");
        String escapedName = fileName.replace("'", "\\'");
        String script = "fetch('" + escapedUrl + "').then(function(r){return r.blob();}).then(function(blob){"
                + "var reader=new FileReader();reader.onloadend=function(){var data=String(reader.result||'');"
                + "var comma=data.indexOf(',');AndroidDownloadBridge.saveBase64File(comma>=0?data.substring(comma+1):data,'"
                + escapedName + "',blob.type||'application/pdf');};reader.readAsDataURL(blob);});";
        webView.evaluateJavascript(script, null);
    }

    private void enqueueHttpDownload(String url, String userAgent, String contentDisposition, String mimeType) {
        try {
            String fileName = guessFileName(contentDisposition, mimeType);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setMimeType(mimeType);
            request.addRequestHeader("User-Agent", userAgent);
            String cookies = CookieManager.getInstance().getCookie(url);
            if (cookies != null) {
                request.addRequestHeader("Cookie", cookies);
            }
            request.setTitle(fileName);
            request.setDescription("Downloading from Eden Desk");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "Eden Desk/" + fileName);
            DownloadManager manager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            manager.enqueue(request);
            Toast.makeText(this, "Download started.", Toast.LENGTH_SHORT).show();
        } catch (Exception exception) {
            Toast.makeText(this, "The document could not be downloaded.", Toast.LENGTH_LONG).show();
        }
    }

    private String guessFileName(String contentDisposition, String mimeType) {
        String guessed = android.webkit.URLUtil.guessFileName("document", contentDisposition, mimeType);
        if (guessed == null || guessed.trim().isEmpty() || guessed.equals("document.bin")) {
            guessed = mimeType != null && mimeType.contains("pdf") ? "eden-desk-document.pdf" : "eden-desk-download";
        }
        return sanitizeFileName(guessed);
    }

    private String sanitizeFileName(String value) {
        String cleaned = value == null ? "eden-desk-document.pdf" : value.replaceAll("[^a-zA-Z0-9._ -]", "_");
        return cleaned.length() > 120 ? cleaned.substring(cleaned.length() - 120) : cleaned;
    }

    private void showOfflinePage() {
        String html = "<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
                + "<style>body{margin:0;font-family:Arial,sans-serif;background:#fff;color:#111;display:grid;place-items:center;min-height:100vh;text-align:center;padding:28px;box-sizing:border-box}"
                + ".box{max-width:420px}h1{font-size:28px;margin:0 0 10px}p{color:#666;line-height:1.6}button{border:0;background:#111;color:#fff;padding:13px 22px;border-radius:10px;font-weight:700;font-size:15px}</style></head>"
                + "<body><div class='box'><h1>Eden Desk is offline</h1><p>Check your internet connection. Any locally cached Eden Desk pages remain available through the web application's offline support.</p>"
                + "<button onclick=\"location.href='" + HOME_URL + "'\">Try again</button></div></body></html>";
        webView.loadDataWithBaseURL(HOME_URL, html, "text/html", "UTF-8", null);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST || pendingFileCallback == null) {
            return;
        }
        Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
        pendingFileCallback.onReceiveValue(results);
        pendingFileCallback = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
        }
        super.onDestroy();
    }

    public final class AndroidDownloadBridge {
        @JavascriptInterface
        public void saveBase64File(String base64Data, String requestedFileName, String mimeType) {
            try {
                byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                String fileName = sanitizeFileName(requestedFileName);
                String actualMimeType = mimeType == null || mimeType.trim().isEmpty()
                        ? "application/octet-stream"
                        : mimeType;

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                    values.put(MediaStore.Downloads.MIME_TYPE, actualMimeType);
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Eden Desk");
                    values.put(MediaStore.Downloads.IS_PENDING, 1);

                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) {
                        throw new IllegalStateException("Unable to create download file");
                    }
                    try (OutputStream stream = getContentResolver().openOutputStream(uri)) {
                        if (stream == null) {
                            throw new IllegalStateException("Unable to open download file");
                        }
                        stream.write(bytes);
                    }
                    values.clear();
                    values.put(MediaStore.Downloads.IS_PENDING, 0);
                    getContentResolver().update(uri, values, null, null);
                } else {
                    File directory = new File(
                            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                            "Eden Desk"
                    );
                    if (!directory.exists() && !directory.mkdirs()) {
                        throw new IllegalStateException("Unable to create download directory");
                    }
                    File target = new File(directory, fileName);
                    try (OutputStream stream = new FileOutputStream(target)) {
                        stream.write(bytes);
                    }
                }

                runOnUiThread(() -> Toast.makeText(
                        MainActivity.this,
                        "Saved to Downloads/Eden Desk",
                        Toast.LENGTH_LONG
                ).show());
            } catch (Exception exception) {
                runOnUiThread(() -> Toast.makeText(
                        MainActivity.this,
                        "The document could not be saved.",
                        Toast.LENGTH_LONG
                ).show());
            }
        }
    }
}
