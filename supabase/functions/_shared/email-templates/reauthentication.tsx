/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://ezbgywgmcowmhwmyrldm.supabase.co/storage/v1/object/public/email-assets/eden-desk-logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Eden Desk verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt="Eden Desk" height="40" style={logo} />
        </Section>
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const logoSection = { marginBottom: '32px' }
const logo = { display: 'block' as const }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0A0A0A',
  margin: '0 0 16px',
  letterSpacing: '-0.025em',
}
const text = {
  fontSize: '15px',
  color: '#555555',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeStyle = {
  fontFamily: "'SF Mono', 'Courier New', monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#0A0A0A',
  letterSpacing: '0.15em',
  margin: '8px 0 32px',
  padding: '16px 24px',
  backgroundColor: '#F5F5F5',
  borderRadius: '12px',
  display: 'inline-block' as const,
}
const footer = { fontSize: '13px', color: '#999999', margin: '24px 0 0', lineHeight: '1.5' }
