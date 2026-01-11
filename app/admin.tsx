import { Ionicons } from "@expo/vector-icons";
import { Text } from "@react-navigation/elements";
import { useNavigation, useRouter } from "expo-router";
import { JSX } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { type Href } from "expo-router";

export default function AdminDashboard(){

const navigation = useNavigation<any>();


const router = useRouter();

  const Card = ({
    title,
    description,
    icon,
    href,
  }: {
    title: string;
    description: string;
    icon: JSX.Element;
    href: Href;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9 },
      ]}
      onPress={() => router.push(href)}
    >
      <View style={styles.iconWrapper}>{icon}</View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>

      <View style={styles.cardAction}>
        <Text style={styles.cardActionText}>Open</Text>
        <Ionicons name="arrow-forward" size={18} color="#aaa" />
      </View>
    </Pressable>
  );



return(<ScrollView style = {styles.page}>

<Text style={styles.title}>
  Admin Dashboard
</Text>

<Text style={styles.subtitle}>
 Manage courses, students, teachers, and view platform analytics
</Text>

<View style={styles.grid}>

<Card
          title="Students"
          description="Manage student accounts and activity"
          href="/admin/students"
          icon={<Ionicons name="school-outline" size={34} color="#fff" />}
/>

<Card
          title="Teachers"
          description="Manage instructors and teaching assignments"
          href="/admin/teachers"
          icon={<Ionicons name="person-circle-outline" size={34} color="#fff" />}
        />


   <Card
          title="Courses"
          description="Oversee courses and curriculum"
          href="/admin/courses"
          icon={<Ionicons name="book-outline" size={34} color="#fff" />}
        />


       <Card
          title="Analytics"
          description="View usage and engagement metrics"
          href="/admin/analytics"
          icon={<Ionicons name="bar-chart-outline" size={34} color="#fff" />}
        />      

</View>

</ScrollView>)

}

const styles = StyleSheet.create({
page:{padding:20,backgroundColor:"#0f0f0f",flexGrow:1},
title:{fontSize:30,fontWeight:"700",color:"#fff",marginBottom:8},
subtitle:{color:"#aaa"},
grid:{flexDirection:"row",flexWrap:"wrap",gap:16},
iconWrapper:{width:56,height:56,borderRadius:28,backgroundColor:"#4f46e5",alignItems:"center",justifyContent:"center",marginBottom:16},
card:{backgroundColor:"#141414",borderRadius:16,padding:20,borderWidth:1,borderColor:"#2a2a2a"},
cardTitle:{color:"#fff",fontSize:20,fontWeight:"700",marginBottom:16,},
cardAction:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
cardActionText:{color:"#aaa",fontWeight:"500"},
cardDescription:{color:"#aaa",lineHeight:22,marginBottom:16,}
});

