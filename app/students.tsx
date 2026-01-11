import { Feather } from "@expo/vector-icons";
import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { View } from "react-native-reanimated/lib/typescript/Animated";

export default function AdminStudents(){
const [search,setSearch]=useState("");
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (<View style={styles.container}>
    <View style={styles.header}>
    
    <Text style={styles.title}>Students</Text>     
     
    <View style={styles.searchBox}>
 <Feather name="search" size={18} color="#666"/>
   
    <TextInput 
    placeholder="Search students..."
    value={search}
    onChangeText={setSearch}
    style={styles.input}
    />
    
    </View>
    
    <TouchableOpacity style={styles.createBtn} 
    onPress={()=> setIsCreateModalOpen(true)}
    >
<Text style={styles.createText}>Create</Text>
    </TouchableOpacity>

    </View>
     

  
    </View>)

}


const styles = StyleSheet.create({
container:{flex:1,padding:16,},
title:{fontSize:24,fontWeight:"bold",marginBottom:12,},
header:{marginBottom:16,},
searchBox:{flexDirection:"row",alignItems:"center",borderWidth:1,borderColor:"#ddd",borderRadius:8,paddingHorizontal:10,marginBottom:10,},
input:{flex:1,padding:8},
createBtn:{backgroundColor:"#2563eb",padding:12,borderRadius:8,alignItems:"center"},
createText:{color:"white",fontWeight:"600",},

})