
import { Issuer, Client, generators } from "openid-client";
import { useToast } from "@/hooks/use-toast";

// Cognito configuration
const COGNITO_BASE_URL = "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_cn1XKgRvI";
const CLIENT_ID = "40ce95qriabb1vg4llg4quav19";
const CLIENT_SECRET = "jq2q33r9ds6olclvh23a2d4iv3ghp0qdj9ku7nfa1lu7glkob9q";
const REDIRECT_URI = window.location.origin + "/auth/callback";

let cognitoClient: Client | null = null;

// Initialize the Cognito client
export const initializeCognitoClient = async (): Promise<Client> => {
  try {
    if (cognitoClient) return cognitoClient;
    
    const issuer = await Issuer.discover(COGNITO_BASE_URL);
    
    cognitoClient = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [REDIRECT_URI],
      response_types: ['code'],
    });
    
    return cognitoClient;
  } catch (error) {
    console.error("Failed to initialize Cognito client:", error);
    throw error;
  }
};

// Handle sign-in
export const signIn = async (email: string, password: string): Promise<string> => {
  try {
    const client = await initializeCognitoClient();
    
    const nonce = generators.nonce();
    const state = generators.state();
    
    // Store these in sessionStorage for verification during callback
    sessionStorage.setItem('nonce', nonce);
    sessionStorage.setItem('state', state);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userPassword', password); // Not ideal in production
    
    const authUrl = client.authorizationUrl({
      scope: 'email openid phone',
      state,
      nonce,
    });
    
    // Redirect to Cognito login page
    window.location.href = authUrl;
    return authUrl;
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error;
  }
};

// Handle sign-up (initiates sign-up flow with Cognito)
export const signUp = async (name: string, email: string, password: string): Promise<void> => {
  try {
    // Store user info in session for use after OTP verification
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userPassword', password);
    
    // In a real implementation, we would call Cognito's sign-up API
    // For now, we'll simulate the process and redirect to our OTP verification page
    window.location.href = '/verify-otp';
  } catch (error) {
    console.error("Sign-up error:", error);
    throw error;
  }
};

// Verify OTP and complete the sign-up process
export const verifyOTP = async (otp: string): Promise<boolean> => {
  try {
    // In a real implementation, this would verify the OTP with Cognito
    // For now, we'll simulate verification success
    localStorage.setItem('isAuthenticated', 'true');
    return true;
  } catch (error) {
    console.error("OTP verification error:", error);
    throw error;
  }
};

// Handle the OAuth callback from Cognito
export const handleAuthCallback = async (urlParams: URLSearchParams): Promise<any> => {
  try {
    const client = await initializeCognitoClient();
    
    // Get the stored values
    const nonce = sessionStorage.getItem('nonce');
    const state = sessionStorage.getItem('state');
    
    if (!nonce || !state) {
      throw new Error('Missing nonce or state');
    }
    
    // Process the callback
    const tokenSet = await client.callback(
      REDIRECT_URI,
      urlParams,
      { nonce, state }
    );
    
    // Get user info using the access token
    const userInfo = await client.userinfo(tokenSet.access_token!);
    
    // Store user info and tokens
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('accessToken', tokenSet.access_token!);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Clear session storage values
    sessionStorage.removeItem('nonce');
    sessionStorage.removeItem('state');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userPassword');
    
    return userInfo;
  } catch (error) {
    console.error("Callback error:", error);
    throw error;
  }
};

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
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to Cognito logout endpoint
    const logoutUrl = `https://ap-south-1cn1xkgrvi.auth.ap-south-1.amazoncognito.com/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(window.location.origin + '/landing')}`;
    window.location.href = logoutUrl;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
