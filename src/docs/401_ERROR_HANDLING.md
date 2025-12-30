# 401 Error Handling System

This document explains the centralized 401 (Unauthorized) error handling system that automatically logs out users and redirects them to the login page when authentication fails.

## 🎯 **Problem Solved**

**Before:** 401 errors would show in console as "Failed to load resource: the server responded with a status of 401 (Unauthorized)" with no user feedback or automatic handling.

**After:** 401 errors are automatically detected, user is logged out, shown a clear message, and redirected to login page.

## 🔧 **Implementation**

### **1. Core Utility (`src/utils/apiErrorHandler.js`)**

**Key Functions:**

- `handle401Error()` - Centralized 401 error handling
- `fetchWithAuth()` - Enhanced fetch with automatic 401 detection
- `setupAxiosInterceptors()` - Axios interceptor for automatic 401 handling
- `handleApiError()` - Generic API error handler

### **2. Enhanced Contexts**

Updated contexts to use the new error handling:

- ✅ **VaccineContext** - Full implementation with both fetch and axios
- ✅ **NotificationContext** - Axios interceptor implementation

## 📝 **Usage Patterns**

### **Pattern 1: Using fetchWithAuth (Recommended for new code)**

```javascript
import { fetchWithAuth, handleApiError } from "../utils/apiErrorHandler";

const myApiCall = async () => {
  try {
    const response = await fetchWithAuth("https://api.example.com/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    // Handle success
  } catch (error) {
    handleApiError(error, "Custom error message");
  }
};
```

### **Pattern 2: Using Axios Interceptors (For existing axios code)**

```javascript
import axios from "axios";
import {
  setupAxiosInterceptors,
  handleApiError,
} from "../utils/apiErrorHandler";

// Setup once per context
const apiClient = setupAxiosInterceptors(axios.create());

const myApiCall = async () => {
  try {
    const response = await apiClient.get("/endpoint");
    // Handle success
  } catch (error) {
    handleApiError(error, "Custom error message");
  }
};
```

### **Pattern 3: Using the Hook (Simplest)**

```javascript
import useApiWithAuth from "../hooks/useApiWithAuth";

const MyComponent = () => {
  const { get, post, put, delete: del } = useApiWithAuth();

  const handleApiCall = async () => {
    try {
      const response = await get("/api/endpoint");
      const data = await response.json();
      // Handle success
    } catch (error) {
      // 401 errors are handled automatically
      console.error("API call failed:", error);
    }
  };
};
```

## 🔄 **Automatic 401 Handling Flow**

1. **API Call Made** → Using fetchWithAuth or axios interceptor
2. **Server Returns 401** → Intercepted automatically
3. **handle401Error() Triggered:**
   - Clear localStorage (preserve "Remember Me" credentials)
   - Clear sessionStorage
   - Clear auth cookies
   - Show toast: "Your session has expired. Please login again."
   - Redirect to `/authentication/login`

## ✅ **Benefits**

### **User Experience:**

- 🎯 **Clear Feedback** - Users see "Your session has expired" message
- 🔄 **Automatic Redirect** - No manual navigation needed
- 💾 **Preserved Credentials** - "Remember Me" data is kept
- 🚀 **Seamless Flow** - Immediate redirect to login

### **Developer Experience:**

- 🛠 **Centralized Handling** - One place to manage 401 errors
- 🔧 **Easy Integration** - Simple patterns to follow
- 📝 **Consistent Behavior** - Same handling across all contexts
- 🐛 **Better Debugging** - Clear error logging

### **Security:**

- 🔒 **Immediate Cleanup** - Auth data cleared instantly
- 🛡 **Prevents Stale Sessions** - Forces re-authentication
- 🔐 **Secure Redirects** - Proper logout flow

## 🚀 **Migration Guide**

### **For Existing fetch() Calls:**

**Before:**

```javascript
const response = await fetch("/api/endpoint", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

if (response.status === 401) {
  // Manual handling needed
}
```

**After:**

```javascript
import { fetchWithAuth } from "../utils/apiErrorHandler";

const response = await fetchWithAuth("/api/endpoint");
// 401 errors handled automatically
```

### **For Existing axios Calls:**

**Before:**

```javascript
const response = await axios.get("/api/endpoint", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**After:**

```javascript
import { setupAxiosInterceptors } from "../utils/apiErrorHandler";

const apiClient = setupAxiosInterceptors(axios.create());
const response = await apiClient.get("/api/endpoint");
// 401 errors handled automatically
```

## 📋 **Implementation Checklist**

### **For Each Context/Provider:**

- [ ] Import error handling utilities
- [ ] Replace direct fetch/axios calls
- [ ] Add proper error handling in catch blocks
- [ ] Test 401 error scenarios
- [ ] Update success/error toast messages

### **Example Context Update:**

```javascript
// 1. Add imports
import { fetchWithAuth, handleApiError } from '../utils/apiErrorHandler';

// 2. Replace fetch calls
const response = await fetchWithAuth(url, options);

// 3. Update error handling
catch (error) {
  handleApiError(error, 'Custom message');
}
```

## 🧪 **Testing 401 Errors**

### **Method 1: Remove Token**

```javascript
// In browser console
localStorage.removeItem("token");
// Then make any API call
```

### **Method 2: Use Invalid Token**

```javascript
// In browser console
localStorage.setItem("token", "invalid-token");
// Then make any API call
```

### **Method 3: Backend Simulation**

- Modify backend to return 401 for specific endpoints
- Test the automatic logout and redirect flow

## 🔍 **Troubleshooting**

### **Issue: 401 errors not being caught**

**Solution:** Make sure you're using `fetchWithAuth` or `setupAxiosInterceptors`

### **Issue: Multiple redirects happening**

**Solution:** Check that you're not calling `handle401Error` multiple times

### **Issue: Remember Me not working**

**Solution:** The system automatically preserves `rememberedUsername` and `rememberedPassword`

### **Issue: Custom error messages not showing**

**Solution:** Use `handleApiError(error, 'Your custom message')`

## 📈 **Next Steps**

1. **Update Remaining Contexts** - Apply the pattern to all API-calling contexts
2. **Add Loading States** - Enhance UX during API calls
3. **Add Retry Logic** - For network failures (not 401s)
4. **Add Offline Handling** - For network connectivity issues

---

**Result:** Users will never see raw 401 errors again. Instead, they get a clear message and are automatically redirected to login when their session expires.
