# Production Deployment Guide - RE Platform

## Pre-Deployment Checklist

### Environment Setup
- [ ] Firebase Project Created
- [ ] Firebase Credentials Obtained
- [ ] Pi Network Dev Account Registered
- [ ] WhatsApp Business API Credentials Ready
- [ ] OTP Provider Account (SMS/Twilio)
- [ ] Domain Name Configured
- [ ] SSL Certificate Valid

### Code Quality
- [ ] All tests passing
- [ ] No console errors
- [ ] TypeScript compilation clean
- [ ] Bundle size optimized
- [ ] Performance metrics acceptable
- [ ] Accessibility audit passed
- [ ] Security scan completed

### Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-db-url
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage

# Pi Network
NEXT_PUBLIC_PI_NETWORK_KEY=your-pi-key
NEXT_PUBLIC_PI_NETWORK_SECRET=your-pi-secret
NEXT_PUBLIC_PI_PAYMENT_API=https://api.pi-network.io

# OTP Authentication
NEXT_PUBLIC_OTP_PROVIDER=twilio
OTP_ACCOUNT_SID=your-twilio-sid
OTP_AUTH_TOKEN=your-twilio-token
OTP_FROM_NUMBER=+1234567890

# WhatsApp
WHATSAPP_BUSINESS_ID=your-business-id
WHATSAPP_API_TOKEN=your-api-token
WHATSAPP_PHONE_NUMBER=201010810558

# General
NEXT_PUBLIC_APP_URL=https://re-platform.com
NODE_ENV=production
```

## Deployment Steps

### 1. Prepare Vercel Project (15 min)
```bash
# Login to Vercel
vercel login

# Create new project
vercel project add

# Link repository
vercel link

# Set environment variables in Vercel dashboard
```

### 2. Configure Database (30 min)
```bash
# Create Firebase project
# 1. Go to firebase.google.com
# 2. Create new project
# 3. Enable Firestore
# 4. Create collections: properties, users, transactions
# 5. Set up security rules
```

### 3. Deploy Smart Contracts (45 min)
```bash
# Prepare Pi Network contract
npm run build:contract

# Deploy to Pi Network testnet first
npm run deploy:testnet

# Verify contract deployment
npm run verify:contract

# Switch to mainnet when ready
npm run deploy:mainnet
```

### 4. Configure Third-Party Services (30 min)
- Set up Twilio account for OTP
- Register WhatsApp Business API
- Configure webhook endpoints
- Test all integrations

### 5. Deploy Application (15 min)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Run health check
curl https://your-app.com/api/system-health
```

## Post-Deployment Verification

### Health Checks
```bash
# Check API endpoints
curl https://re-platform.com/api/payments
curl https://re-platform.com/api/system-health

# Verify database connectivity
# Test OTP functionality
# Test payment processing
# Verify WhatsApp integration
```

### Performance Monitoring
- Set up Vercel Analytics
- Configure error tracking (Sentry)
- Monitor database performance
- Track payment success rates
- Monitor API response times

## Rollback Plan

If issues occur:
```bash
# Revert to previous version
vercel rollback

# Or redeploy from git
git checkout previous-commit
vercel --prod
```

## Monitoring & Maintenance

### Daily Tasks
- Check error logs
- Monitor performance metrics
- Review failed transactions
- Check API uptime

### Weekly Tasks
- Backup database
- Security audit
- Performance review
- User feedback analysis

### Monthly Tasks
- Full security scan
- Load testing
- Dependency updates
- Disaster recovery drill

## Support & Escalation

### Contact Information
- Email: globalbusiness435@gmail.com
- WhatsApp: +201010810558
- Emergency: Create GitHub issue with 🔴 tag

### Common Issues & Solutions

**OTP Not Sending:**
- Check Twilio credentials
- Verify phone number format
- Check rate limits

**Payments Failing:**
- Verify Pi Network keys
- Check transaction limits
- Review error logs

**Database Connection Issues:**
- Check Firebase credentials
- Verify network access
- Test Firestore connection

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] SQL injection protection
- [ ] CORS properly configured
- [ ] Sensitive data encrypted
- [ ] Regular security audits scheduled
