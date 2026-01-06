import { useAuth } from "../context/AuthContext";



export default function AuthenticationScreen(){

const {user,login,signup,error,authError,isLoading}=useAuth();


const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");



}