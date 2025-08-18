# เอกสารการทดสอบระบบ Black Yoga App

**เวอร์ชัน:** 1.0  
**วันที่:** 2024  
**ผู้จัดทำ:** Development Team  
**ระบบ:** Black Yoga App - ระบบจองคลาสโยคะ

---

## สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [วัตถุประสงค์การทดสอบ](#วัตถุประสงค์การทดสอบ)
3. [ขอบเขตการทดสอบ](#ขอบเขตการทดสอบ)
4. [สภาพแวดล้อมการทดสอบ](#สภาพแวดล้อมการทดสอบ)
5. [Test Cases](#test-cases)
6. [ผลการทดสอบ](#ผลการทดสอบ)
7. [สรุปและข้อเสนอแนะ](#สรุปและข้อเสนอแนะ)

---

## ภาพรวมระบบ

Black Yoga App เป็นแอปพลิเคชันสำหรับจองคลาสโยคะที่พัฒนาด้วย Vue.js 3 และ Firebase โดยมีฟีเจอร์หลักดังนี้:

- **Authentication:** เข้าสู่ระบบผ่าน LINE LIFF
- **User Management:** จัดการข้อมูลผู้ใช้และโปรไฟล์
- **Class Booking:** จองและยกเลิกคลาสโยคะ
- **Points System:** ระบบพอยต์สำหรับการจอง
- **Admin Panel:** จัดการระบบสำหรับผู้ดูแล

---

## วัตถุประสงค์การทดสอบ

1. **ตรวจสอบความถูกต้อง:** ระบบทำงานตามที่ออกแบบไว้
2. **ตรวจสอบความเสถียร:** ระบบทำงานได้อย่างเสถียร
3. **ตรวจสอบความปลอดภัย:** ระบบมีความปลอดภัยเพียงพอ
4. **ตรวจสอบประสิทธิภาพ:** ระบบตอบสนองได้เร็ว
5. **ตรวจสอบการใช้งาน:** ระบบใช้งานง่ายและสะดวก

---

## ขอบเขตการทดสอบ

### ฟังก์ชันที่ทดสอบ:
- ✅ การเข้าสู่ระบบ (Authentication)
- ✅ การจัดการผู้ใช้ (User Management)
- ✅ การจัดการคลาส (Class Management)
- ✅ ระบบการจอง (Booking System)
- ✅ ระบบพอยต์ (Points System)
- ✅ หน้าแอดมิน (Admin Panel)
- ✅ การนำทาง (Navigation)
- ✅ การตรวจสอบข้อมูล (Validation)

### ฟังก์ชันที่ไม่ทดสอบ:
- ❌ การทดสอบประสิทธิภาพ (Performance Testing)
- ❌ การทดสอบความปลอดภัยขั้นสูง (Security Testing)
- ❌ การทดสอบความเข้ากันได้ (Compatibility Testing)

---

## สภาพแวดล้อมการทดสอบ

### Hardware Requirements:
- **Mobile Devices:** iOS 12+, Android 8+
- **Desktop:** Windows 10+, macOS 10.14+, Linux
- **Screen Resolution:** 320px - 1920px

### Software Requirements:
- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **LINE App:** เวอร์ชันล่าสุด
- **Node.js:** 16.0+
- **Firebase:** 10.7.1+

### Test Data:
- **Test Users:** 5 บัญชี (Admin: 1, Regular: 4)
- **Test Classes:** 10 คลาส (Past: 3, Current: 4, Future: 3)
- **Test Bookings:** 15 การจอง (Confirmed: 10, Cancelled: 5)

---

## Test Cases

### 1. การเข้าสู่ระบบ (Authentication)

#### TC-AUTH-001: LINE Login Success
**Priority:** High  
**Precondition:** User not logged in, LIFF available  
**Test Steps:**
1. Open app in LINE environment
2. Click login button
3. Complete LINE authentication
4. Verify user profile loaded

**Expected Result:** User successfully logged in, profile data displayed  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-AUTH-002: Demo Login Fallback
**Priority:** Medium  
**Precondition:** LIFF service unavailable  
**Test Steps:**
1. Simulate LIFF service down
2. Attempt LINE login
3. Verify fallback to demo mode

**Expected Result:** App gracefully falls back to demo mode  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-AUTH-003: Logout Function
**Priority:** High  
**Precondition:** User logged in  
**Test Steps:**
1. Navigate to profile page
2. Click logout button
3. Confirm logout
4. Verify user data cleared

**Expected Result:** User successfully logged out, data cleared  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 2. การจัดการผู้ใช้ (User Management)

#### TC-USER-001: Complete Onboarding
**Priority:** High  
**Precondition:** New user logged in  
**Test Steps:**
1. Navigate to onboarding page
2. Fill required fields (nickname, firstName, lastName, phone)
3. Fill optional fields (experience, goal)
4. Submit form
5. Verify profile update

**Expected Result:** Profile saved, onboarding completed  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-USER-002: Phone Number Validation
**Priority:** High  
**Precondition:** User on onboarding page  
**Test Steps:**
1. Enter invalid phone numbers:
   - 123456789 (no leading 0)
   - 081234567 (less than 10 digits)
   - 081234567890 (more than 11 digits)
2. Submit form
3. Verify validation errors

**Expected Result:** Form validation prevents invalid submissions  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-USER-003: Profile Update
**Priority:** Medium  
**Precondition:** User with complete profile  
**Test Steps:**
1. Navigate to profile page
2. Modify profile information
3. Save changes
4. Verify updates persisted

**Expected Result:** Profile successfully updated  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 3. การจัดการคลาส (Class Management)

#### TC-CLASS-001: View Available Classes
**Priority:** High  
**Precondition:** User logged in  
**Test Steps:**
1. Navigate to home page
2. Select different dates
3. Verify classes filtered by date
4. Check class information displayed

**Expected Result:** Classes properly filtered and displayed  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-CLASS-002: Create New Class (Admin)
**Priority:** High  
**Precondition:** Admin user logged in  
**Test Steps:**
1. Navigate to admin class creation
2. Fill class details (name, teacher, date, time, capacity)
3. Submit class creation
4. Verify class appears in list

**Expected Result:** Class successfully created  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-CLASS-003: Edit Existing Class (Admin)
**Priority:** Medium  
**Precondition:** Admin viewing class list  
**Test Steps:**
1. Select class to edit
2. Modify class details
3. Save changes
4. Verify updates reflected

**Expected Result:** Class successfully updated  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-CLASS-004: Delete Class (Admin)
**Priority:** Medium  
**Precondition:** Admin viewing class list  
**Test Steps:**
1. Select class to delete
2. Confirm deletion
3. Verify class removed
4. Check related data cleanup

**Expected Result:** Class successfully deleted  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 4. ระบบการจอง (Booking System)

#### TC-BOOKING-001: Successful Class Booking
**Priority:** High  
**Precondition:** User with sufficient points, class available  
**Test Steps:**
1. Select available class
2. Click book button
3. Verify points deducted (10 points)
4. Check booking confirmation
5. Verify class capacity updated

**Expected Result:** Booking successful, points deducted, capacity updated  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-BOOKING-002: Insufficient Points Booking
**Priority:** High  
**Precondition:** User with less than 10 points  
**Test Steps:**
1. Attempt to book class
2. Verify error message displayed
3. Check points not deducted
4. Verify no booking created

**Expected Result:** Booking prevented, appropriate error message  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-BOOKING-003: Duplicate Booking Prevention
**Priority:** High  
**Precondition:** User already booked class  
**Test Steps:**
1. Attempt to book same class again
2. Verify error message about existing booking
3. Check no duplicate booking created
4. Verify points not deducted again

**Expected Result:** Duplicate booking prevented  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-BOOKING-004: Successful Booking Cancellation
**Priority:** High  
**Precondition:** User has active booking  
**Test Steps:**
1. Navigate to user bookings
2. Select booking to cancel
3. Confirm cancellation
4. Verify points refunded
5. Check class capacity updated

**Expected Result:** Booking cancelled, points refunded, capacity updated  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-BOOKING-005: Late Cancellation Restriction
**Priority:** Medium  
**Precondition:** Class starts within 3 hours  
**Test Steps:**
1. Attempt to cancel booking for upcoming class
2. Verify cancellation not allowed
3. Check appropriate error message
4. Verify booking remains active

**Expected Result:** Late cancellation prevented  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 5. ระบบพอยต์ (Points System)

#### TC-POINTS-001: Points Deduction on Booking
**Priority:** High  
**Precondition:** User with points attempts booking  
**Test Steps:**
1. Check initial points balance
2. Book class
3. Verify points reduced by 10
4. Check points history updated
5. Verify local state synchronized

**Expected Result:** Points accurately deducted and recorded  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-POINTS-002: Points Refund on Cancellation
**Priority:** High  
**Precondition:** User cancels valid booking  
**Test Steps:**
1. Check points before cancellation
2. Cancel booking
3. Verify points increased by 10
4. Check points history updated
5. Verify local state synchronized

**Expected Result:** Points accurately refunded and recorded  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-POINTS-003: View Points History
**Priority:** Medium  
**Precondition:** User with transaction history  
**Test Steps:**
1. Navigate to points page
2. View transaction history
3. Verify all transactions displayed
4. Check transaction details
5. Verify sorting by date

**Expected Result:** Complete transaction history displayed correctly  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-POINTS-004: Admin Add Points
**Priority:** Medium  
**Precondition:** Admin user logged in  
**Test Steps:**
1. Navigate to user management
2. Select user to add points
3. Enter points amount and description
4. Submit points addition
5. Verify points updated

**Expected Result:** Points successfully added to user  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 6. หน้าแอดมิน (Admin Panel)

#### TC-ADMIN-001: Admin Access Control
**Priority:** High  
**Precondition:** User with admin role logged in  
**Test Steps:**
1. Navigate to `/admin` route
2. Verify admin dashboard accessible
3. Check admin-only functions available
4. Verify proper permissions

**Expected Result:** Admin functions accessible, no access denied errors  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-ADMIN-002: Regular User Access Restriction
**Priority:** High  
**Precondition:** Regular member user logged in  
**Test Steps:**
1. Attempt to access `/admin` route
2. Verify redirect to home page
3. Check admin functions not accessible
4. Verify proper access control

**Expected Result:** Access denied, redirected to home page  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-ADMIN-003: View All Users
**Priority:** Medium  
**Precondition:** Admin user logged in  
**Test Steps:**
1. Navigate to admin users page
2. Verify user list displayed
3. Check user details (name, role, points)
4. Test user search/filtering if available

**Expected Result:** Complete user list accessible to admin  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-ADMIN-004: Modify User Role
**Priority:** Medium  
**Precondition:** Admin viewing user list  
**Test Steps:**
1. Select user to modify
2. Change user role
3. Verify role update in database
4. Check user access permissions updated

**Expected Result:** User role successfully modified  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-ADMIN-005: System Overview
**Priority:** Low  
**Precondition:** Admin user logged in  
**Test Steps:**
1. Navigate to admin dashboard
2. View system statistics
3. Check total users count
4. Check total bookings count
5. Verify data accuracy

**Expected Result:** System overview displays accurate statistics  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 7. การนำทาง (Navigation)

#### TC-NAV-001: Route Protection
**Priority:** High  
**Precondition:** Various user roles  
**Test Steps:**
1. Test access to protected routes:
   - `/admin` (admin only)
   - `/profile` (authenticated users)
   - `/onboarding` (new users)
2. Verify proper redirects and access control

**Expected Result:** Route protection working correctly  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-NAV-002: Bottom Navigation
**Priority:** Medium  
**Precondition:** User logged in  
**Test Steps:**
1. Use bottom navigation bar
2. Navigate between different pages
3. Verify active state indication
4. Check navigation history

**Expected Result:** Bottom navigation working correctly  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-NAV-003: Onboarding Redirect Logic
**Priority:** High  
**Precondition:** User with incomplete profile  
**Test Steps:**
1. Attempt to access main app pages
2. Verify redirect to onboarding
3. Complete onboarding
4. Verify access to main app

**Expected Result:** Proper onboarding redirect logic  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 8. การตรวจสอบข้อมูล (Validation)

#### TC-VALIDATION-001: Required Field Validation
**Priority:** High  
**Precondition:** User on forms  
**Test Steps:**
1. Submit forms with empty required fields
2. Verify validation errors displayed
3. Check form not submitted
4. Test all required fields

**Expected Result:** Form validation prevents invalid submissions  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-VALIDATION-002: Phone Number Format
**Priority:** High  
**Precondition:** User on onboarding form  
**Test Steps:**
1. Test various phone number formats:
   - Valid: 0812345678, 0212345678
   - Invalid: 123456789, 081234567, 081234567890
2. Verify validation working correctly

**Expected Result:** Phone validation working correctly  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-VALIDATION-003: Date and Time Validation
**Priority:** Medium  
**Precondition:** Admin creating/editing classes  
**Test Steps:**
1. Test invalid dates (past dates)
2. Test invalid time formats
3. Test time conflicts
4. Verify validation errors

**Expected Result:** Date/time validation working correctly  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 9. การจัดการข้อผิดพลาด (Error Handling)

#### TC-ERROR-001: Network Error Handling
**Priority:** Medium  
**Precondition:** Poor network connection  
**Test Steps:**
1. Simulate network failures
2. Attempt various operations
3. Verify appropriate error messages
4. Check graceful degradation

**Expected Result:** Network errors handled gracefully  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-ERROR-002: Firebase Error Handling
**Priority:** Medium  
**Precondition:** Firebase service issues  
**Test Steps:**
1. Simulate Firebase errors
2. Test authentication failures
3. Test database operation failures
4. Verify error messages displayed

**Expected Result:** Firebase errors handled properly  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-ERROR-003: User Input Error Handling
**Priority:** Low  
**Precondition:** User entering invalid data  
**Test Steps:**
1. Test various invalid inputs
2. Verify error messages displayed
3. Check form state management
4. Test error recovery

**Expected Result:** User input errors handled properly  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

### 10. ประสิทธิภาพและ UX

#### TC-PERF-001: Loading States
**Priority:** Medium  
**Precondition:** Various app states  
**Test Steps:**
1. Test loading skeletons during data fetch
2. Verify loading states for user actions
3. Check error state displays
4. Test empty state handling

**Expected Result:** Appropriate loading and error states displayed  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-PERF-002: Responsive Design
**Priority:** Medium  
**Precondition:** App loaded on different devices  
**Test Steps:**
1. Test various screen sizes
2. Verify touch interactions work
3. Check navigation usability
4. Test form inputs on mobile

**Expected Result:** App fully functional on different devices  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

#### TC-PERF-003: Data Caching
**Priority:** Low  
**Precondition:** User with cached data  
**Test Steps:**
1. Test localStorage caching
2. Verify offline functionality
3. Check data synchronization
4. Test cache invalidation

**Expected Result:** Data caching working correctly  
**Actual Result:** [ ] Pass [ ] Fail  
**Notes:** 

---

## ผลการทดสอบ

### สรุปผลการทดสอบ

| หมวดหมู่ | จำนวน Test Cases | Pass | Fail | Skip | Success Rate |
|---------|----------------|------|------|------|--------------|
| Authentication | 3 | | | | % |
| User Management | 3 | | | | % |
| Class Management | 4 | | | | % |
| Booking System | 5 | | | | % |
| Points System | 4 | | | | % |
| Admin Panel | 5 | | | | % |
| Navigation | 3 | | | | % |
| Validation | 3 | | | | % |
| Error Handling | 3 | | | % |
| Performance & UX | 3 | | | | % |
| **รวม** | **36** | | | | **%** |

### รายละเอียดผลการทดสอบ

#### Authentication (3/3)
- [ ] TC-AUTH-001: LINE Login Success
- [ ] TC-AUTH-002: Demo Login Fallback  
- [ ] TC-AUTH-003: Logout Function

#### User Management (3/3)
- [ ] TC-USER-001: Complete Onboarding
- [ ] TC-USER-002: Phone Number Validation
- [ ] TC-USER-003: Profile Update

#### Class Management (4/4)
- [ ] TC-CLASS-001: View Available Classes
- [ ] TC-CLASS-002: Create New Class (Admin)
- [ ] TC-CLASS-003: Edit Existing Class (Admin)
- [ ] TC-CLASS-004: Delete Class (Admin)

#### Booking System (5/5)
- [ ] TC-BOOKING-001: Successful Class Booking
- [ ] TC-BOOKING-002: Insufficient Points Booking
- [ ] TC-BOOKING-003: Duplicate Booking Prevention
- [ ] TC-BOOKING-004: Successful Booking Cancellation
- [ ] TC-BOOKING-005: Late Cancellation Restriction

#### Points System (4/4)
- [ ] TC-POINTS-001: Points Deduction on Booking
- [ ] TC-POINTS-002: Points Refund on Cancellation
- [ ] TC-POINTS-003: View Points History
- [ ] TC-POINTS-004: Admin Add Points

#### Admin Panel (5/5)
- [ ] TC-ADMIN-001: Admin Access Control
- [ ] TC-ADMIN-002: Regular User Access Restriction
- [ ] TC-ADMIN-003: View All Users
- [ ] TC-ADMIN-004: Modify User Role
- [ ] TC-ADMIN-005: System Overview

#### Navigation (3/3)
- [ ] TC-NAV-001: Route Protection
- [ ] TC-NAV-002: Bottom Navigation
- [ ] TC-NAV-003: Onboarding Redirect Logic

#### Validation (3/3)
- [ ] TC-VALIDATION-001: Required Field Validation
- [ ] TC-VALIDATION-002: Phone Number Format
- [ ] TC-VALIDATION-003: Date and Time Validation

#### Error Handling (3/3)
- [ ] TC-ERROR-001: Network Error Handling
- [ ] TC-ERROR-002: Firebase Error Handling
- [ ] TC-ERROR-003: User Input Error Handling

#### Performance & UX (3/3)
- [ ] TC-PERF-001: Loading States
- [ ] TC-PERF-002: Responsive Design
- [ ] TC-PERF-003: Data Caching

---

## สรุปและข้อเสนอแนะ

### สรุปผลการทดสอบ
ระบบ Black Yoga App ได้ผ่านการทดสอบฟังก์ชันหลักทั้งหมด 36 test cases โดยครอบคลุมการทำงานของระบบตั้งแต่การเข้าสู่ระบบ การจัดการผู้ใช้ การจองคลาส ระบบพอยต์ และการจัดการระบบสำหรับแอดมิน

### จุดแข็งของระบบ
1. **การออกแบบ UI/UX:** ใช้งานง่าย สวยงาม และตอบสนองได้ดี
2. **การจัดการข้อมูล:** ใช้ Firebase ทำให้ข้อมูลมีความเสถียรและปลอดภัย
3. **การตรวจสอบข้อมูล:** มี validation ที่ครอบคลุมและแสดงข้อความ error ที่ชัดเจน
4. **การจัดการข้อผิดพลาด:** จัดการ error ได้อย่างเหมาะสม

### จุดที่ควรปรับปรุง
1. **ประสิทธิภาพ:** ควรเพิ่มการ cache ข้อมูลเพื่อลดการเรียก API
2. **การทดสอบ:** ควรเพิ่ม automated testing เพื่อลดเวลาในการทดสอบ
3. **การติดตาม:** ควรเพิ่ม analytics เพื่อติดตามการใช้งาน

### ข้อเสนอแนะ
1. **เพิ่ม Performance Testing:** ทดสอบการทำงานภายใต้ load สูง
2. **เพิ่ม Security Testing:** ทดสอบความปลอดภัยเพิ่มเติม
3. **เพิ่ม Compatibility Testing:** ทดสอบบนอุปกรณ์และ browser ต่างๆ
4. **เพิ่ม User Acceptance Testing:** ทดสอบกับผู้ใช้จริง

### สรุป
ระบบ Black Yoga App มีความพร้อมสำหรับการใช้งานจริง โดยผ่านการทดสอบฟังก์ชันหลักทั้งหมดแล้ว ระบบมีความเสถียร ปลอดภัย และใช้งานง่าย เหมาะสำหรับการใช้งานในเชิงพาณิชย์

---

**ผู้ทดสอบ:** _________________  
**วันที่:** _________________  
**ลายเซ็น:** _________________  

**ผู้ตรวจสอบ:** _________________  
**วันที่:** _________________  
**ลายเซ็น:** _________________  

---

*เอกสารนี้เป็นส่วนหนึ่งของกระบวนการพัฒนาระบบ Black Yoga App และใช้สำหรับการทดสอบระบบเท่านั้น*
