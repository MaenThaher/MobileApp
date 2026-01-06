import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { useAuth } from "../context/AuthContext";
import {
    loginSchema,
    LoginSchema,
    signupSchema,
    SignupSchema,
} from "../schema/authSchemas";

export default function AuthenticationScreen(){

const {user,login,signup,error,authError,isLoading}=useAuth();


const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 useEffect(() => {
    if (user === undefined) return; // auth still loading

    if (user) {
      router.replace("/About");
    }
  }, [user]);

  /* Sync auth error */
  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

 const {
    register: registerLogin,
    handleSubmit: submitLogin,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm<LoginSchema>({
    resolver: yupResolver(loginSchema),
  });

  /* Signup form */
  const {
    register: registerSignup,
    handleSubmit: submitSignup,
    setValue: setSignupValue,
    formState: { errors: signupErrors },
  } = useForm<SignupSchema>({
    resolver: yupResolver(signupSchema),
  });

  useEffect(() => {
    registerLogin("email");
    registerLogin("password");

    registerSignup("name");
    registerSignup("email");
    registerSignup("password");
    registerSignup("confirm");
    registerSignup("role");
  }, []);

  const onLogin = async (data: LoginSchema) => {
    try {
      setError("");
      await login(data.email, data.password);
      setSuccess("Login successful!");
      router.replace("/About");
    } catch (e: any) {
      setError(e.message || "Login failed");
    }
  };

 const onSignup = async (data: SignupSchema) => {
    try {
      setError("");
      await signup(data.email, data.password, data.name, data.role);
      setSuccess("Account created!");
      router.replace("/About");
    } catch (e: any) {
      setError(e.message || "Signup failed");
    }
  };


  return ( <ScrollView contentContainerStyle={styles.container}>
  
  <View style={styles.header}>
        <Icon name="cpu" size={36} />
        <Text style={styles.title}>CircuitAI</Text>
        <Text style={styles.subtitle}>
          Intelligent Circuit Simulation & Analysis
        </Text>
      </View>


 {!showForgotPassword && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "login" && styles.tabActive,
            ]}
            onPress={() => {
              setActiveTab("login");
              setError("");
            }}
          >
            <Text>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "signup" && styles.tabActive,
            ]}
            onPress={() => {
              setActiveTab("signup");
              setError("");
            }}
          >
            <Text>Create account</Text>
          </TouchableOpacity>
        </View>
      )}




  
   <Text style={styles.footer}>
        Available for An-Najah engineering students & instructors
      </Text>
  </ScrollView>
  );
}