# 📧 Email Verification Setup Guide

## Current Issue: Verification Codes Not Arriving

The email service is responding successfully, but emails aren't reaching inboxes. Here's how to fix it:

## 🔍 Common Causes & Solutions

### 1. **Resend API Key Issues**

#### Check if you're using a test key:
- Test keys only simulate sending but don't deliver emails
- You need a **real API key** for actual email delivery

#### Get a proper Resend API key:
1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Sign up/Login to your account
3. Go to **API Keys** section
4. Create a new API key (NOT a test key)
5. Copy the key (starts with `re_`)

#### Update your `.env.local`:
```env
# Replace with your REAL Resend API key
RESEND_API_KEY=re_your_actual_api_key_here
```

### 2. **Domain Verification (Most Common Issue)**

Resend requires domain verification for reliable email delivery:

#### Option A: Use Resend's Domain (Quick Fix)
Update the "from" address in `src/helpers/sendVerificationEmail.ts`:
```typescript
const emailData = await resend.emails.send({
    from: 'no-reply@yourdomain.com', // Change this
    to: email,
    subject: 'AnonChat | Verification Code',
    react: VerificationEmail({username, otp: verifyCode}),
});
```

#### Option B: Verify Your Own Domain (Recommended)
1. In Resend Dashboard → **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records provided by Resend
4. Wait for verification (can take up to 24 hours)

### 3. **Email Provider Restrictions**

Some email providers block emails from unverified senders:

#### Check these locations:
- ✅ **Spam/Junk folder**
- ✅ **Promotions tab** (Gmail)
- ✅ **Blocked senders list**

#### Whitelist the sender:
- Add `onboarding@resend.dev` to your contacts
- Or use your verified domain email

### 4. **Rate Limiting**

Resend has sending limits on free plans:
- Free plan: 100 emails/day, 1 email/second
- Check your Resend dashboard for usage

## 🧪 Testing Email Delivery

### Test with a different email:
Try signing up with a different email provider:
- Gmail, Yahoo, Outlook, etc.
- See if the problem persists

### Check Resend logs:
1. Go to Resend Dashboard → **Logs**
2. Look for your recent email attempts
3. Check for delivery status and errors

## ⚡ Quick Fix Options

### Option 1: Use a Mock Email Service (Development)
For testing purposes, you can temporarily log verification codes:

```typescript
// In src/helpers/sendVerificationEmail.ts - Add this for testing
console.log(`
=================================
📧 VERIFICATION CODE FOR TESTING
=================================
Email: ${email}
Username: ${username}
Code: ${verifyCode}
=================================
`);
```

### Option 2: Temporarily Disable Email Verification
For development, you can auto-verify users:

```typescript
// In src/app/api/sign-up/route.ts
const newUser = new UserModel({
    username,
    email,
    password: hashedPassword,
    verifyCode,
    verifyCodeExpiry: expiryDate,
    isVerified: true, // Auto-verify for development
    isAcceptingMessages: true,
    messages: [],
});
```

## 🔧 Immediate Action Steps

1. **Check Spam Folder** - Most common issue
2. **Verify Resend API Key** - Ensure it's not a test key
3. **Try Different Email** - Test with Gmail/Yahoo
4. **Check Resend Dashboard** - Look at logs and usage
5. **Consider Domain Verification** - For production use

## 📝 Production Setup Checklist

- [ ] Real Resend API key (not test)
- [ ] Domain verified in Resend
- [ ] DNS records properly configured
- [ ] "From" email uses verified domain
- [ ] Rate limits considered
- [ ] Email template tested
- [ ] Spam folder instructions for users

## 🆘 Still Not Working?

If emails still aren't arriving after trying these steps:

1. Check Resend dashboard logs for delivery errors
2. Try a completely different email service (SendGrid, Mailgun)
3. Consider using phone/SMS verification instead
4. Contact Resend support with your API key details

## 🔍 Debug Information

Current email configuration:
- **Service**: Resend
- **From Address**: `onboarding@resend.dev`
- **API Key Status**: Present
- **Template**: React Email component
- **Test Result**: Success (but not delivering)

This suggests the issue is likely with **domain verification** or **email provider blocking**. 