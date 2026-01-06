import { useAuth } from "../context/AuthContext";



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

}