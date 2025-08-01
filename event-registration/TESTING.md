# Panduan Testing

Panduan lengkap untuk testing aplikasi Event Registration System.

## 🧪 Testing Strategy

### 1. Unit Testing
- Component testing dengan Jest & React Testing Library
- Utility function testing
- Form validation testing

### 2. Integration Testing
- API endpoint testing
- Database integration testing
- Email service testing

### 3. End-to-End Testing
- User flow testing dengan Playwright/Cypress
- Cross-browser compatibility
- Mobile responsiveness

### 4. Manual Testing
- User acceptance testing
- Accessibility testing
- Performance testing

## 🚀 Quick Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📋 Manual Testing Checklist

### 🏠 Homepage Testing

#### Functionality
- [ ] Homepage loads correctly
- [ ] Navigation links work
- [ ] Responsive design on mobile/tablet
- [ ] All icons and images display correctly
- [ ] "Mulai Sekarang" button redirects to admin login

#### Performance
- [ ] Page loads in < 3 seconds
- [ ] No JavaScript errors in console
- [ ] Lighthouse score > 90

### 🔐 Admin Authentication

#### Registration
- [ ] Admin can register with email/password
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] Success message displayed
- [ ] Redirect to dashboard after registration

#### Login
- [ ] Admin can login with valid credentials
- [ ] Error message for invalid credentials
- [ ] "Show/Hide password" toggle works
- [ ] Remember me functionality
- [ ] Redirect to dashboard after login

#### Security
- [ ] Protected routes redirect to login
- [ ] Logout functionality works
- [ ] Session persistence across browser refresh
- [ ] Cannot access other admin's data

### 📊 Admin Dashboard

#### Overview
- [ ] Statistics display correctly
- [ ] Event list shows admin's events only
- [ ] "Buat Event Baru" button works
- [ ] Event cards display complete information
- [ ] Progress bars show correct percentages

#### Navigation
- [ ] All navigation links work
- [ ] Breadcrumbs display correctly
- [ ] Back buttons function properly
- [ ] Responsive design on all devices

### 🎯 Event Creation

#### Basic Information
- [ ] All form fields validate correctly
- [ ] Auto-slug generation from title
- [ ] Date/time pickers work
- [ ] Price field accepts decimal values
- [ ] Quota field only accepts positive integers
- [ ] Google Maps URL validation

#### Image Upload
- [ ] Image upload works
- [ ] Preview displays correctly
- [ ] File size validation (max 5MB)
- [ ] File type validation (JPG, PNG)
- [ ] Portrait aspect ratio maintained

#### Form Builder
- [ ] Can add different field types
- [ ] Drag & drop reordering works
- [ ] Field editing works
- [ ] Field deletion works
- [ ] Required field toggle works
- [ ] Select options can be modified
- [ ] Preview updates in real-time

#### Submission
- [ ] Form validates before submission
- [ ] Loading state displayed
- [ ] Success redirect to event management
- [ ] Error handling for failures

### 🎪 Public Event Page

#### Display
- [ ] Event information displays correctly
- [ ] Image shows with correct aspect ratio
- [ ] Date/time formatted properly
- [ ] Location and maps link work
- [ ] Quota information accurate
- [ ] Progress bar reflects current registrations

#### Registration Form
- [ ] Dynamic form fields render correctly
- [ ] All field types work properly
- [ ] Form validation works
- [ ] Required fields enforced
- [ ] File upload for payment proof works
- [ ] Success redirect to thank you page

#### Edge Cases
- [ ] Quota full scenario handled
- [ ] Invalid event slug shows 404
- [ ] Inactive events not accessible
- [ ] Form submission with network errors

### 👥 Participant Management

#### Participant List
- [ ] All participants display correctly
- [ ] Filter by status works
- [ ] Search functionality works
- [ ] Pagination works (if implemented)
- [ ] Sort by date/name works

#### Status Management
- [ ] Can update payment status
- [ ] Confirmation dialog works
- [ ] Loading states during updates
- [ ] Success/error messages display
- [ ] Email notifications sent

#### Data Export
- [ ] CSV export includes all data
- [ ] Dynamic form fields included
- [ ] File downloads correctly
- [ ] Data formatting correct

#### Detail View
- [ ] Participant details modal works
- [ ] All form data displays
- [ ] Payment proof link works
- [ ] Modal close functionality

### 📧 Email System

#### Email Sending
- [ ] Confirmation emails sent automatically
- [ ] Rejection emails sent automatically
- [ ] Email templates render correctly
- [ ] All event details included
- [ ] HTML and text versions work

#### Email Content
- [ ] Subject lines appropriate
- [ ] Event information accurate
- [ ] Status clearly indicated
- [ ] Contact information included
- [ ] Unsubscribe link (if required)

#### Delivery
- [ ] Emails delivered to inbox
- [ ] Not marked as spam
- [ ] Mobile email clients render correctly
- [ ] Links in emails work

## 🔧 Technical Testing

### Database
```sql
-- Test data integrity
SELECT COUNT(*) FROM events WHERE admin_id IS NULL;
SELECT COUNT(*) FROM registrants WHERE event_id NOT IN (SELECT id FROM events);

-- Test RLS policies
-- Should return only admin's events
SELECT * FROM events WHERE admin_id != 'current_user_id';
```

### API Endpoints
```bash
# Test payment status update
curl -X POST http://localhost:3000/api/update-payment-status \
  -H "Content-Type: application/json" \
  -d '{"registrantId": "uuid", "status": "confirmed"}'
```

### File Upload
- [ ] Upload different file types
- [ ] Test file size limits
- [ ] Test invalid file types
- [ ] Test storage permissions
- [ ] Test file URL generation

## 📱 Cross-Platform Testing

### Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Devices
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Large Mobile (414x896)

### Operating Systems
- [ ] Windows 10/11
- [ ] macOS
- [ ] iOS
- [ ] Android
- [ ] Linux (Ubuntu)

## 🚨 Error Scenarios

### Network Issues
- [ ] Slow network conditions
- [ ] Intermittent connectivity
- [ ] Complete network failure
- [ ] Timeout scenarios

### Server Errors
- [ ] Database connection failure
- [ ] Email service unavailable
- [ ] Storage service down
- [ ] API rate limiting

### User Errors
- [ ] Invalid form submissions
- [ ] Duplicate registrations
- [ ] Expired sessions
- [ ] Malicious input attempts

## 📊 Performance Testing

### Load Testing
```bash
# Using Artillery.io
npm install -g artillery
artillery quick --count 10 --num 5 http://localhost:3000
```

### Metrics to Monitor
- [ ] Page load time < 3 seconds
- [ ] Time to First Byte < 1 second
- [ ] Largest Contentful Paint < 2.5 seconds
- [ ] First Input Delay < 100ms
- [ ] Cumulative Layout Shift < 0.1

### Database Performance
- [ ] Query execution time < 100ms
- [ ] Connection pool efficiency
- [ ] Index usage optimization
- [ ] N+1 query prevention

## ♿ Accessibility Testing

### WCAG 2.1 Compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast ratios adequate
- [ ] Alt text for images
- [ ] Form labels properly associated

### Tools
- [ ] axe DevTools extension
- [ ] Lighthouse accessibility audit
- [ ] NVDA/JAWS screen reader testing
- [ ] Color blindness simulator

## 🔒 Security Testing

### Authentication
- [ ] SQL injection prevention
- [ ] XSS attack prevention
- [ ] CSRF protection
- [ ] Session management
- [ ] Password security

### Data Protection
- [ ] PII data encryption
- [ ] Secure file uploads
- [ ] API endpoint protection
- [ ] Environment variable security

### Tools
```bash
# OWASP ZAP security scanning
# Snyk vulnerability scanning
npm audit
```

## 📈 Monitoring & Analytics

### Error Tracking
- [ ] JavaScript errors logged
- [ ] API errors tracked
- [ ] User actions monitored
- [ ] Performance metrics collected

### User Analytics
- [ ] Page views tracked
- [ ] User flows analyzed
- [ ] Conversion rates measured
- [ ] A/B test results

## 🎯 Pre-Production Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No TypeScript errors
- [ ] ESLint warnings resolved
- [ ] Build successful

### Functionality
- [ ] All features working
- [ ] Edge cases handled
- [ ] Error messages user-friendly
- [ ] Loading states implemented
- [ ] Success confirmations clear

### Performance
- [ ] Lighthouse scores > 90
- [ ] Core Web Vitals green
- [ ] Image optimization complete
- [ ] Bundle size optimized
- [ ] Caching strategies implemented

### Security
- [ ] Environment variables secure
- [ ] API endpoints protected
- [ ] User input sanitized
- [ ] File uploads secure
- [ ] HTTPS enforced

### User Experience
- [ ] Responsive design tested
- [ ] Accessibility compliant
- [ ] Error handling graceful
- [ ] Navigation intuitive
- [ ] Forms user-friendly

## 🐛 Bug Reporting Template

```markdown
## Bug Report

**Environment:** [Development/Staging/Production]
**Browser:** [Chrome 96.0.4664.110]
**Device:** [Desktop/Mobile/Tablet]
**User Role:** [Admin/Public User]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. See error

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach screenshots if applicable]

**Console Errors:**
[Any JavaScript errors in console]

**Additional Context:**
[Any other relevant information]
```

## 📋 Test Data

### Sample Admin Account
```
Email: admin@example.com
Password: TestPassword123!
```

### Sample Event Data
```json
{
  "title": "Workshop Web Development",
  "description": "Belajar membuat website modern",
  "price": 150000,
  "quota": 50,
  "tanggal_event": "2024-03-15",
  "jam_event": "09:00",
  "lokasi_event": "Jakarta Convention Center"
}
```

### Sample Form Fields
```json
[
  {
    "id": "name",
    "type": "text",
    "label": "Nama Lengkap",
    "required": true
  },
  {
    "id": "email",
    "type": "email", 
    "label": "Email",
    "required": true
  },
  {
    "id": "phone",
    "type": "tel",
    "label": "Nomor Telepon",
    "required": true
  }
]
```

Pastikan semua test cases di atas berhasil sebelum deployment ke production! ✅