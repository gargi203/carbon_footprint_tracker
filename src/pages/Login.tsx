import React, { useState } from 'react';
import { useEcoTrack } from '../context/EcoTrackContext';
import ecotrackLogo from '../assets/logo.png';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  UserCheck
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, signUp, loginWithGoogle, loginWithGithub, isCloudMode } = useEcoTrack();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation states (touched & error messages)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Real-time validations
  const validateField = (field: string, value: string) => {
    let errorMsg = '';
    
    if (field === 'name' && activeTab === 'signup') {
      if (!value.trim()) {
        errorMsg = 'Name is required.';
      }
    }
    
    if (field === 'email') {
      if (!value.trim()) {
        errorMsg = 'Email is required.';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errorMsg = 'Please enter a valid email address.';
      }
    }
    
    if (field === 'password') {
      if (!value) {
        errorMsg = 'Password is required.';
      } else if (value.length < 6) {
        errorMsg = 'Password must be at least 6 characters.';
      }
    }

    setValidationErrors(prev => {
      const next = { ...prev };
      if (errorMsg) {
        next[field] = errorMsg;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleInputChange = (field: string, value: string) => {
    setSubmitError(null);
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Validate live if already touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setSubmitError(null);
    setTouched({});
    setValidationErrors({});
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Touch all active fields
    const fieldsToValidate = activeTab === 'signup' ? ['name', 'email', 'password'] : ['email', 'password'];
    const newTouched: Record<string, boolean> = {};
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
      newTouched[field] = true;
      const val = field === 'name' ? name : field === 'email' ? email : password;
      validateField(field, val);
      
      // Check validation live
      let errorMsg = '';
      if (field === 'name' && activeTab === 'signup' && !val.trim()) errorMsg = 'Name is required.';
      if (field === 'email') {
        if (!val.trim()) errorMsg = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(val)) errorMsg = 'Invalid email address.';
      }
      if (field === 'password') {
        if (!val) errorMsg = 'Password is required.';
        else if (val.length < 6) errorMsg = 'Password must be at least 6 characters.';
      }
      if (errorMsg) hasErrors = true;
    });

    setTouched(newTouched);

    if (hasErrors) {
      setSubmitError('Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(async () => {
      if (activeTab === 'signin') {
        const res = await login(email, password);
        if (!res.success) {
          setSubmitError(res.error || 'Failed to sign in.');
        }
      } else {
        const res = await signUp(name, email, password);
        if (!res.success) {
          setSubmitError(res.error || 'Failed to create account.');
        }
      }
      setIsSubmitting(false);
    }, 800);
  };

  // Continue as Guest bypass
  const handleGuestBypass = () => {
    setIsSubmitting(true);
    setTimeout(async () => {
      // Register guest account if not exists
      const res = await signUp('Guest User', 'guest@ecotrack.ai', 'guest123');
      if (!res.success) {
        // If already exists, log in
        await login('guest@ecotrack.ai', 'guest123');
      }
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-20 min-h-[80vh] animate-fade-in">
      <div className="w-full max-w-md">
        
        {/* EcoTrack Logo & Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-white/10 dark:bg-black/10 p-3 rounded-2xl shadow-xl backdrop-blur-md mb-4 border border-white/20">
            <img 
              src={ecotrackLogo} 
              alt="EcoTrack AI brand logo showing leaf node" 
              className="w-16 h-16 rounded-xl object-contain shadow-sm"
            />
          </div>
          <h1 className="text-3xl font-extrabold font-display bg-gradient-to-r from-eco-600 to-teal-brand bg-clip-text text-transparent dark:from-eco-400 dark:to-teal-brand tracking-tight">
            EcoTrack AI
          </h1>
          <p className="text-sm font-semibold text-eco-600 dark:text-eco-400 tracking-wider uppercase mt-1">
            Sustainability Copilot
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 max-w-xs leading-relaxed">
            Monitor lifestyle carbon emissions, earn eco badges, and commit to climate-friendly habits.
          </p>
        </div>

        {/* Auth Glassmorphic Card Container */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl border border-white/25 dark:border-white/10 animate-scale-in">
          
          {/* Tabs */}
          <div className="flex bg-gray-100/50 dark:bg-gray-800/40 p-1 rounded-xl mb-6" role="tablist">
            <button
              onClick={() => handleTabSwitch('signin')}
              role="tab"
              aria-selected={activeTab === 'signin'}
              aria-controls="auth-form-panel"
              id="tab-signin"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabSwitch('signup')}
              role="tab"
              aria-selected={activeTab === 'signup'}
              aria-controls="auth-form-panel"
              id="tab-signup"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Panel */}
          <form 
            id="auth-form-panel" 
            role="tabpanel" 
            aria-labelledby={`tab-${activeTab}`}
            onSubmit={handleSubmit} 
            className="space-y-5"
            noValidate
          >
            {/* Global/API Error banner */}
            {submitError && (
              <div 
                className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-slide-up"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Account Seeding Instructions (Only on Sign In) */}
            {activeTab === 'signin' && !submitError && (
              <div className="p-3 bg-eco-500/10 border border-eco-500/20 rounded-xl text-[11px] text-eco-700 dark:text-eco-400 leading-relaxed font-semibold">
                💡 <span className="font-bold">Quick Demo:</span> Log in with <span className="underline select-all">demo@ecotrack.ai</span> and password <span className="underline select-all">password123</span> to see pre-populated environmental history and metrics.
              </div>
            )}

            {/* Name field (Sign Up only) */}
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label 
                  htmlFor="signup-name" 
                  className="block text-xs font-bold text-gray-750 dark:text-gray-300 uppercase tracking-wide"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    id="signup-name"
                    required
                    value={name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    onBlur={e => handleBlur('name', e.target.value)}
                    placeholder="Jane Doe"
                    aria-describedby={touched.name && validationErrors.name ? "name-error" : undefined}
                    aria-invalid={touched.name && !!validationErrors.name}
                    className={`w-full pl-10.5 pr-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none transition-all ${
                      touched.name && validationErrors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                        : 'border-gray-200 dark:border-gray-850 focus:border-eco-500 dark:focus:border-eco-400'
                    }`}
                  />
                </div>
                {touched.name && validationErrors.name && (
                  <p 
                    id="name-error" 
                    className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-1"
                    role="status"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label 
                htmlFor="auth-email" 
                className="block text-xs font-bold text-gray-750 dark:text-gray-300 uppercase tracking-wide"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  id="auth-email"
                  required
                  value={email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  onBlur={e => handleBlur('email', e.target.value)}
                  placeholder="name@example.com"
                  aria-describedby={touched.email && validationErrors.email ? "email-error" : undefined}
                  aria-invalid={touched.email && !!validationErrors.email}
                  className={`w-full pl-10.5 pr-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none transition-all ${
                    touched.email && validationErrors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                      : 'border-gray-200 dark:border-gray-850 focus:border-eco-500 dark:focus:border-eco-400'
                  }`}
                />
              </div>
              {touched.email && validationErrors.email && (
                <p 
                  id="email-error" 
                  className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-1"
                  role="status"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="auth-password" 
                  className="block text-xs font-bold text-gray-750 dark:text-gray-300 uppercase tracking-wide"
                >
                  Password
                </label>
                <span className="text-[10px] text-gray-400 font-semibold">min. 6 characters</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  onBlur={e => handleBlur('password', e.target.value)}
                  placeholder="••••••••"
                  aria-describedby={touched.password && validationErrors.password ? "password-error" : undefined}
                  aria-invalid={touched.password && !!validationErrors.password}
                  className={`w-full pl-10.5 pr-12 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none transition-all ${
                    touched.password && validationErrors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                      : 'border-gray-200 dark:border-gray-850 focus:border-eco-500 dark:focus:border-eco-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {touched.password && validationErrors.password && (
                <p 
                  id="password-error" 
                  className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-1"
                  role="status"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-eco-600 to-teal-brand hover:from-eco-700 hover:to-teal-brand-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-eco-500/15 hover:shadow-lg hover:shadow-eco-500/20 flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                <>
                  {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            
            {/* Social Logins */}
            <div className="space-y-3.5 pt-1">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-250/20 dark:border-gray-800/40"></div>
                </div>
                <span className="relative bg-white dark:bg-[#15231c] px-3 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                  or login with
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-700 bg-white/50 dark:bg-gray-900 text-gray-700 dark:text-gray-350 font-bold text-sm shadow-sm transition-all hover:scale-[1.01] hover:bg-white dark:hover:bg-gray-850 cursor-pointer"
                >
                  <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.926 15.47 1 12.24 1 5.48 1 0 6.48 0 13.2s5.48 12.2 12.24 12.2c7.055 0 11.75-4.965 11.75-11.965 0-.805-.085-1.42-.19-2.15H12.24z"
                    />
                  </svg>
                  <span>Google</span>
                </button>
                
                <button
                  type="button"
                  onClick={loginWithGithub}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-700 bg-white/50 dark:bg-gray-900 text-gray-700 dark:text-gray-350 font-bold text-sm shadow-sm transition-all hover:scale-[1.01] hover:bg-white dark:hover:bg-gray-850 cursor-pointer"
                >
                  <svg className="h-4.5 w-4.5 text-gray-900 dark:text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
              
              {!isCloudMode && (
                <p className="text-[10px] text-center text-amber-600 dark:text-amber-500/80 font-bold bg-amber-500/5 py-1.5 px-2.5 rounded-lg border border-amber-500/10 leading-normal">
                  ⚠️ Google & GitHub OAuth requires Supabase env configurations.
                </p>
              )}
            </div>

          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <span className="relative bg-white dark:bg-[#15231c] px-3 text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              or
            </span>
          </div>

          {/* Guest Bypass Action Button */}
          <button
            type="button"
            onClick={handleGuestBypass}
            disabled={isSubmitting}
            className="w-full border-2 border-gray-200 dark:border-gray-800 hover:border-eco-500 dark:hover:border-eco-400 bg-transparent hover:bg-eco-50/10 dark:hover:bg-eco-950/10 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="h-4.5 w-4.5 text-eco-550" />
            Continue as Guest
          </button>

        </div>

      </div>
    </div>
  );
};
