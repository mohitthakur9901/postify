
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useSignOut } from "../hooks/useSignOut";
const SignOutButton = () => {
    const { handleSignOut } = useSignOut();
    return (
        <TouchableOpacity onPress={handleSignOut} activeOpacity={0.8}>
            <Feather name="log-out" size={24} color={"#E0245E"} />
        </TouchableOpacity>
    );
};
export default SignOutButton;