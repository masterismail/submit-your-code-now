import { useToast } from "@/hooks/use-toast";

// Cognito configuration
const COGNITO_BASE_URL = "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_cn1XKgRvI";
const CLIENT_ID = "40ce95qriabb1vg4llg4quav19";
const CLIENT_SECRET = "jq2q33r9ds6olclvh23a2d4iv3ghp0qdj9ku7nfa1lu7glkob9q";
const REDIRECT_URI = window.location.origin + "/auth/callback";
const COGNITO_DOMAIN = "https://ap-south-1-cn1xkgrvi.auth.ap-south-1.amazoncognito.com";

// Handle sign-in by redirecting to Cognito hosted UI
export const signIn = async (email: string, password: string): Promise<void> => {
  try {
    // Store email for verification after callback
    sessionStorage.setItem('userEmail', email);
    
    // Generate and store state for CSRF protection
    const state = generateRandomString(32);
    sessionStorage.setItem('auth_state', state);
    
    // Build the authorization URL manually (avoiding Node.js-specific libraries)
    const authUrl = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
    
    // Redirect to Cognito login page
    window.location.href = authUrl;
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error;
  }
};

// Handle sign-up by redirecting to Cognito hosted UI signup page
export const signUp = async (name: string, email: string, password: string): Promise<void> => {
  try {
    // Store user info for use after verification
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userEmail', email);
    
    // Generate and store state for CSRF protection
    const state = generateRandomString(32);
    sessionStorage.setItem('auth_state', state);
    
    // Build the signup URL manually
    const signupUrl = `${COGNITO_DOMAIN}/signup?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
    
    // Redirect to Cognito signup page
    window.location.href = signupUrl;
  } catch (error) {
    console.error("Sign-up error:", error);
    throw error;
  }
};

// Verify OTP for signup process (handled by Cognito in this implementation)
export const verifyOTP = async (otp: string): Promise<boolean> => {
  try {
    // In this implementation, OTP verification is handled by Cognito
    // This function is kept for compatibility with existing code
    return true;
  } catch (error) {
    console.error("OTP verification error:", error);
    throw error;
  }
};

// Handle the OAuth callback from Cognito
export const handleAuthCallback = async (params: URLSearchParams): Promise<any> => {
  try {
    // Check if there's an error in the callback
    if (params.has('error')) {
      const errorDescription = params.get('error_description') || 'Authentication failed';
      throw new Error(errorDescription);
    }
    
    // Get the authorization code and state
    const code = params.get('code');
    const state = params.get('state');
    const storedState = sessionStorage.getItem('auth_state');
    
    // Verify state to prevent CSRF attacks
    if (!state || state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    
    if (!code) {
      throw new Error('No authorization code received');
    }
    
    // Exchange the code for tokens
    const tokenResponse = await fetchTokens(code);
    
    if (!tokenResponse.access_token) {
      throw new Error('Failed to retrieve access token');
    }
    
    // Get user info using the access token
    const userInfo = await fetchUserInfo(tokenResponse.access_token);
    
    // Store user info and tokens
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('accessToken', tokenResponse.access_token);
    localStorage.setItem('refreshToken', tokenResponse.refresh_token || '');
    localStorage.setItem('idToken', tokenResponse.id_token || '');
    localStorage.setItem('isAuthenticated', 'true');
    
    // Clear session storage values
    sessionStorage.removeItem('auth_state');
    
    return userInfo;
  } catch (error) {
    console.error("Callback error:", error);
    throw error;
  }
};

// Exchange authorization code for tokens
async function fetchTokens(code: string) {
  const tokenEndpoint = `${COGNITO_DOMAIN}/oauth2/token`;
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', CLIENT_ID);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('code', code);
  params.append('client_secret', CLIENT_SECRET);
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }
  
  return await response.json();
}

// Fetch user information using the access token
async function fetchUserInfo(accessToken: string) {
  const userInfoEndpoint = `${COGNITO_DOMAIN}/oauth2/userInfo`;
  
  const response = await fetch(userInfoEndpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }
  
  return await response.json();
}

// Generate random string for state parameter
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  randomValues.forEach(value => {
    result += charset[value % charset.length];
  });
  return result;
}

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Get the current user info
export const getCurrentUser = (): any => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Clear all authentication data
    localStorage.removeItem('userInfo');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to Cognito logout endpoint with the corrected domain
    const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(window.location.origin + '/landing')}`;
    window.location.href = logoutUrl;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
