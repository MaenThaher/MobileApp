import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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



}