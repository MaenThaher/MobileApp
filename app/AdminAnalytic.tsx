import { Text } from "@react-navigation/elements";
import { ScrollView, StyleSheet } from "react-native";

export default function AdminAnalyticsScreen(){

return(<ScrollView style={styles.container}>
    <Text style={styles.title}>Analytics Dashboard</Text>
    


       </ScrollView>)


}

const styles = StyleSheet.create({
    container:{flex:1,backgroundColor:"#F4F6F8",padding:16},
    title:{fontSize:22,fontWeight:"700",marginBottom:16},
});
