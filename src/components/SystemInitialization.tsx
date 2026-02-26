import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Database,
  UserPlus,
  ArrowRight,
  Loader2,
  Check,
  AlertTriangle
} from "lucide-react";
import { systemApi } from "../services/systemApi";

interface SystemReadiness {
  schemaExists: boolean;
  systemInitialized: boolean;
  readyForInitialization: boolean;
  readyForCompleteSetup: boolean;
  message: string;
}

interface AdminFormData {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

// Password strength validator
function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#22c55e"]; // Red to Green

  return {
    strength,
    label: labels[strength] || labels[0],
    color: colors[strength] || colors[0],
  };
}

// Readiness Check Component
function ReadinessCheck({
  onReady
}: {
  onReady: (readiness: SystemReadiness) => void
}) {
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<SystemReadiness | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSystemReadiness();
  }, []);

  const checkSystemReadiness = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the systemApi to check readiness
      const result = await systemApi.checkReadiness();
      setReadiness(result);
      onReady(result);
    } catch (error) {
      console.error("Failed to check readiness", error);
      setError("Failed to check system readiness. Please refresh the page to try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>
            <Loader2 style={styles.spinnerIcon} />
          </div>
          <h2 style={styles.loadingTitle}>Checking System Status</h2>
          <p style={styles.loadingSubtitle}>Please wait while we verify the system readiness...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorBox}>
            <AlertTriangle style={styles.errorIcon} />
            <div style={styles.errorText}>{error}</div>
          </div>
          <button
            onClick={checkSystemReadiness}
            style={styles.primaryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!readiness) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Shield style={styles.headerIcon} />
          <h1 style={styles.headerTitle}>System Readiness Check</h1>
          <p style={styles.headerSubtitle}>{readiness.message}</p>
        </div>

        <div style={styles.statusList}>
          <StatusItem
            label="Database Schema"
            status={readiness.schemaExists}
            description="Database tables and structure"
          />
          <StatusItem
            label="System Initialized"
            status={readiness.systemInitialized}
            description="Super admin and core setup"
          />
          <StatusItem
            label="Ready for Initialization"
            status={readiness.readyForInitialization}
            description="Can create super admin"
          />
          <StatusItem
            label="Ready for Complete Setup"
            status={readiness.readyForCompleteSetup}
            description="Needs full system setup"
          />
        </div>

        <div style={styles.buttonGroup}>
          <button 
            onClick={checkSystemReadiness}
            style={styles.secondaryButton}
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  status,
  description
}: {
  label: string;
  status: boolean;
  description: string;
}) {
  return (
    <div style={styles.statusItem}>
      <div style={styles.statusIcon}>
        {status ? (
          <CheckCircle2 style={styles.statusIconCheck} />
        ) : (
          <XCircle style={styles.statusIconX} />
        )}
      </div>
      <div style={styles.statusContent}>
        <div style={styles.statusLabel}>{label}</div>
        <div style={styles.statusDescription}>{description}</div>
      </div>
      <div style={status ? styles.statusBadgeReady : styles.statusBadgePending}>
        {status ? "Ready" : "Pending"}
      </div>
    </div>
  );
}

// Complete Setup Wizard
function CompleteSetupWizard({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [migrationStatus, setMigrationStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [migrationMessage, setMigrationMessage] = useState("");
  const [initError, setInitError] = useState<string | null>(null);

  const runMigrations = async () => {
    setMigrationStatus("running");
    setMigrationMessage("Running database migrations...");
    setInitError(null);

    try {
      const result = await systemApi.runMigrations();
      if (result.success) {
        setMigrationStatus("success");
        setMigrationMessage(result.message);
        setTimeout(() => setCurrentStep(2), 1500);
      } else {
        setMigrationStatus("error");
        setMigrationMessage(result.message);
      }
    } catch (error) {
      console.error("Migration error:", error);
      setMigrationStatus("error");
      setMigrationMessage("Failed to run migrations. Please check your connection and try again.");
    }
  };

  const handleAdminCreated = async (data: AdminFormData) => {
    setInitError(null);
    try {
      const result = await systemApi.initializeComplete(data);
      if (result.success) {
        onComplete();
      } else {
        setInitError(result.message);
      }
    } catch (error) {
      console.error("Failed to initialize system", error);
      setInitError("Failed to initialize system. Please check your connection and try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.setupHeader}>
          <h1 style={styles.setupTitle}>Complete System Setup</h1>
          <p style={styles.setupSubtitle}>Follow these steps to initialize your system</p>
        </div>

        {/* Progress Steps */}
        <div style={styles.progressSteps}>
          <div style={currentStep >= 1 ? styles.progressStepActive : styles.progressStepInactive}></div>
          <div style={currentStep >= 2 ? styles.progressStepActive : styles.progressStepInactive}></div>
        </div>

        {currentStep === 1 && (
          <div>
            <div style={styles.stepHeader}>
              <Database style={styles.stepIcon} />
              <div>
                <h2 style={styles.stepTitle}>Step 1: Database Schema Setup</h2>
                <p style={styles.stepSubtitle}>Initialize the database structure</p>
              </div>
            </div>

            {migrationStatus === "idle" && (
              <div style={styles.migrationIdle}>
                <div style={styles.alertBox}>
                  <Database style={styles.alertIcon} />
                  <div style={styles.alertText}>
                    This will create all necessary database tables and structures.
                    The process may take a few moments.
                  </div>
                </div>
                <button
                  onClick={runMigrations}
                  style={styles.primaryButton}
                >
                  Run Database Migrations
                  <ArrowRight style={styles.buttonIcon} />
                </button>
              </div>
            )}

            {migrationStatus === "running" && (
              <div style={styles.migrationRunning}>
                <div style={styles.spinner}>
                  <Loader2 style={styles.spinnerLarge} />
                </div>
                <p style={styles.migrationMessage}>{migrationMessage}</p>
              </div>
            )}

            {migrationStatus === "success" && (
              <div style={styles.successBox}>
                <CheckCircle2 style={styles.successIcon} />
                <div style={styles.successText}>{migrationMessage}</div>
              </div>
            )}

            {migrationStatus === "error" && (
              <div>
                <div style={styles.errorBox}>
                  <AlertTriangle style={styles.errorIcon} />
                  <div style={styles.errorText}>{migrationMessage}</div>
                </div>
                <button
                  onClick={runMigrations}
                  style={styles.secondaryButton}
                >
                  Retry Migration
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div style={styles.stepHeader}>
              <UserPlus style={styles.stepIcon} />
              <div>
                <h2 style={styles.stepTitle}>Step 2: Create Super Admin</h2>
                <p style={styles.stepSubtitle}>Set up your administrator account</p>
              </div>
            </div>
            <AdminForm onSubmit={handleAdminCreated} error={initError} />
          </div>
        )}
      </div>
    </div>
  );
}

// Initialize Admin Only (when schema exists)
function InitializeAdmin({ onComplete }: { onComplete: () => void }) {
  const [initError, setInitError] = useState<string | null>(null);

  const handleAdminCreated = async (data: AdminFormData) => {
    setInitError(null);
    try {
      const result = await systemApi.initializeAdmin(data);
      if (result.success) {
        onComplete();
      } else {
        setInitError(result.message);
      }
    } catch (error) {
      console.error("Failed to create admin", error);
      setInitError("Failed to create admin. Please check your connection and try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.adminHeader}>
          <UserPlus style={styles.adminIcon} />
          <h1 style={styles.adminTitle}>Create Super Admin</h1>
          <p style={styles.adminSubtitle}>Initialize your system by creating the administrator account</p>
        </div>
        {initError && (
          <div style={styles.errorBox}>
            <AlertTriangle style={styles.errorIcon} />
            <div style={styles.errorText}>{initError}</div>
          </div>
        )}
        <AdminForm onSubmit={handleAdminCreated} />
      </div>
    </div>
  );
}

// Admin Form Component
function AdminForm({ onSubmit, error }: { onSubmit: (data: AdminFormData) => void; error?: string | null }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>();

  const password = watch("password", "");
  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onFormSubmit = async (data: AdminFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} style={styles.form}>
      {error && (
        <div style={styles.formErrorBox}>
          <AlertTriangle style={styles.formErrorIcon} />
          <div style={styles.formErrorText}>{error}</div>
        </div>
      )}
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Email Address *</label>
        <input
          type="email"
          style={errors.email ? {...styles.formInput, ...styles.formInputError} : styles.formInput}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p style={styles.errorMessage}>{errors.email.message}</p>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Full Name *</label>
        <input
          style={errors.fullName ? {...styles.formInput, ...styles.formInputError} : styles.formInput}
          {...register("fullName", {
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
        />
        {errors.fullName && (
          <p style={styles.errorMessage}>{errors.fullName.message}</p>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Phone Number (Optional)</label>
        <input
          type="tel"
          style={styles.formInput}
          {...register("phone")}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Password *</label>
        <input
          type="password"
          style={errors.password ? {...styles.formInput, ...styles.formInputError} : styles.formInput}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            validate: (value) => {
              const hasUpperCase = /[A-Z]/.test(value);
              const hasLowerCase = /[a-z]/.test(value);
              const hasNumber = /\d/.test(value);

              if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return "Password must contain uppercase, lowercase, and number";
              }
              return true;
            },
          })}
        />
        {passwordStrength && (
          <div style={styles.passwordStrengthContainer}>
            <div style={styles.passwordStrengthBar}>
              <div 
                style={{
                  ...styles.passwordStrengthFill,
                  width: `${(passwordStrength.strength / 5) * 100}%`,
                  backgroundColor: passwordStrength.color
                }}
              />
            </div>
            <span style={{...styles.passwordStrengthLabel, color: passwordStrength.color}}>
              {passwordStrength.label}
            </span>
          </div>
        )}
        {errors.password && (
          <p style={styles.errorMessage}>{errors.password.message}</p>
        )}
        <p style={styles.formHelper}>At least 8 characters with uppercase, lowercase, and number</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Confirm Password *</label>
        <input
          type="password"
          style={errors.confirmPassword ? {...styles.formInput, ...styles.formInputError} : styles.formInput}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p style={styles.errorMessage}>{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        style={isSubmitting ? {...styles.primaryButton, ...styles.buttonDisabled} : styles.primaryButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 style={styles.buttonSpinner} />
            Creating Account...
          </>
        ) : (
          <>
            Create Super Admin Account
            <ArrowRight style={styles.buttonIcon} />
          </>
        )}
      </button>
    </form>
  );
}

// Success Dashboard
function SuccessDashboard() {
  const adminEmail = localStorage.getItem("adminEmail") || "admin@example.com";

  const handleReset = () => {
    localStorage.removeItem("systemInitialized");
    localStorage.removeItem("schemaExists");
    localStorage.removeItem("adminEmail");
    window.location.reload();
  };

  // Auto-redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successHeader}>
          <CheckCircle2 style={styles.successHeaderIcon} />
          <h1 style={styles.successTitle}>System Initialized Successfully!</h1>
          <p style={styles.successSubtitle}>Your system is now ready to use</p>
        </div>

        <div style={styles.successContent}>
          <div style={styles.successCard}>
            <div style={styles.successCardHeader}>
              <Shield style={styles.successCardIcon} />
              <div style={styles.successCardText}>
                <div style={styles.successCardTitle}>Super Admin Account Created</div>
                <div style={styles.successCardSubtitle}>Email: <span style={styles.emailHighlight}>{adminEmail}</span></div>
              </div>
            </div>
          </div>

          <div style={styles.infoBox}>
            <Database style={styles.infoIcon} />
            <div style={styles.infoText}>
              Database schema has been created and the system is ready for use.
              Redirecting to login...
            </div>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            style={styles.primaryButton}
            onClick={() => window.location.reload()}
          >
            Go to Login
            <ArrowRight style={styles.buttonIcon} />
          </button>
          <button
            style={styles.secondaryButton}
            onClick={handleReset}
          >
            Reset System (Demo Only)
          </button>
        </div>
      </div>
    </div>
  );
}

// Main System Initialization Component
export default function SystemInitialization({ onSystemInitialized }: { onSystemInitialized?: () => void } = {}) {
  const [systemState, setSystemState] = useState<"checking" | "complete-setup" | "admin-only" | "completed">("checking");
  const [readiness, setReadiness] = useState<SystemReadiness | null>(null);

  const handleReadinessCheck = (result: SystemReadiness) => {
    setReadiness(result);

    if (result.systemInitialized) {
      // If system is already initialized, notify parent to show login
      if (onSystemInitialized) {
        onSystemInitialized();
      } else {
        // Fallback: reload to trigger app state update
        window.location.reload();
      }
    } else if (result.readyForCompleteSetup) {
      setSystemState("complete-setup");
    } else if (result.readyForInitialization) {
      setSystemState("admin-only");
    }
  };

  const handleSetupComplete = () => {
    // Notify parent that setup is complete so it can show login
    if (onSystemInitialized) {
      onSystemInitialized();
    } else {
      // Fallback: reload to trigger app state update
      window.location.reload();
    }
  };

  if (systemState === "checking") {
    return <ReadinessCheck onReady={handleReadinessCheck} />;
  }

  if (systemState === "complete-setup") {
    return <CompleteSetupWizard onComplete={handleSetupComplete} />;
  }

  if (systemState === "admin-only") {
    return <InitializeAdmin onComplete={handleSetupComplete} />;
  }

  if (systemState === "completed") {
    return <SuccessDashboard />;
  }

  return null;
}

// Styles object
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    maxWidth: '48rem',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
  },
  headerIcon: {
    width: '4rem',
    height: '4rem',
    color: '#2563eb',
    margin: '0 auto 1rem',
  },
  headerTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  headerSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
  },
  statusList: {
    marginBottom: '1.5rem',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: '#f9fafb',
    marginBottom: '0.5rem',
  },
  statusIcon: {
    marginTop: '0.25rem',
  },
  statusIconCheck: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#16a34a',
  },
  statusIconX: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#94a3b8',
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontWeight: 500,
    color: '#0f172a',
    marginBottom: '0.25rem',
  },
  statusDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  statusBadgeReady: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    backgroundColor: '#0f172a',
    color: '#ffffff',
  },
  statusBadgePending: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
  },
  primaryButton: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    cursor: 'not-allowed',
  },
  buttonIcon: {
    width: '1rem',
    height: '1rem',
  },
  buttonSpinner: {
    width: '1rem',
    height: '1rem',
    marginRight: '0.5rem',
    animation: 'spin 1s linear infinite',
  },
  setupHeader: {
    marginBottom: '2rem',
  },
  setupTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  setupSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
  },
  progressSteps: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  progressStepActive: {
    flex: 1,
    height: '0.5rem',
    backgroundColor: '#2563eb',
    borderRadius: '9999px',
  },
  progressStepInactive: {
    flex: 1,
    height: '0.5rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  stepIcon: {
    width: '2rem',
    height: '2rem',
    color: '#2563eb',
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  stepSubtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  migrationIdle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  alertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '0.5rem',
  },
  alertIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#0ea5e9',
  },
  alertText: {
    fontSize: '0.875rem',
    color: '#0c4a6e',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerIcon: {
    width: '3rem',
    height: '3rem',
    color: '#2563eb',
    animation: 'spin 1s linear infinite',
  },
  spinnerLarge: {
    width: '3rem',
    height: '3rem',
    color: '#2563eb',
    animation: 'spin 1s linear infinite',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  loadingCard: {
    padding: '2rem',
    maxWidth: '24rem',
    width: '100%',
    textAlign: 'center' as const,
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
  },
  loadingTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1f2937',
  },
  loadingSubtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  migrationRunning: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  migrationMessage: {
    fontSize: '1rem',
    color: '#64748b',
    marginTop: '1rem',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  successIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#16a34a',
  },
  successText: {
    color: '#065f46',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  errorIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#dc2626',
  },
  errorText: {
    color: '#991b1b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  formInput: {
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s',
  },
  formInputError: {
    borderColor: '#dc2626',
  },
  errorMessage: {
    fontSize: '0.75rem',
    color: '#dc2626',
    marginTop: '0.25rem',
  },
  formErrorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  formErrorIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#dc2626',
  },
  formErrorText: {
    color: '#991b1b',
    fontSize: '0.875rem',
  },
  formHelper: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  passwordStrengthContainer: {
    marginTop: '0.5rem',
  },
  passwordStrengthBar: {
    width: '100%',
    height: '0.375rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  },
  passwordStrengthFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  passwordStrengthLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  adminHeader: {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
  },
  adminIcon: {
    width: '4rem',
    height: '4rem',
    color: '#2563eb',
    margin: '0 auto 1rem',
  },
  adminTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  adminSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
  },
  successHeader: {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
  },
  successHeaderIcon: {
    width: '5rem',
    height: '5rem',
    color: '#16a34a',
    margin: '0 auto 1rem',
  },
  successTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  successSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
  },
  successContent: {
    marginBottom: '1.5rem',
  },
  successCard: {
    padding: '1rem',
    backgroundColor: '#eff6ff',
    border: '1px solid #bae6fd',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  successCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  successCardIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#2563eb',
    marginTop: '0.25rem',
  },
  successCardText: {
    flex: 1,
  },
  successCardTitle: {
    fontWeight: 600,
    color: '#1e3a8a',
    marginBottom: '0.25rem',
  },
  successCardSubtitle: {
    fontSize: '0.875rem',
    color: '#1e40af',
  },
  emailHighlight: {
    fontFamily: 'monospace',
    fontWeight: 500,
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '0.5rem',
  },
  infoIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#0ea5e9',
  },
  infoText: {
    color: '#0c4a6e',
  },
};

// Add keyframes for spin animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);