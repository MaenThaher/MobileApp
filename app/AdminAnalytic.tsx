import { Feather } from "@expo/vector-icons";
import { Text } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";




type CoursePopularity = {
  courseId: string;
  courseCode: string;
  courseName: string;
  studentCount: number;
  assignmentCount: number;
  submissionCount: number;
  averageGrade: number | null;
};


function parseAnalyticsResponse(data: any) {
  return {
    overview: {
      totalUsers: data?.overviewMetrics?.total_users || 0,
      activeUsers: data?.overviewMetrics?.active_users || 0,
      totalCourses: data?.overviewMetrics?.total_courses || 0,
      activeCourses: data?.overviewMetrics?.active_courses || 0,
      totalAssignments: data?.overviewMetrics?.total_assignments || 0,
      publishedAssignments:
        data?.overviewMetrics?.published_assignments || 0,
      totalSubmissions: data?.overviewMetrics?.total_submissions || 0,
      gradedSubmissions:
        data?.overviewMetrics?.graded_submissions || 0,
    },
    courses: (data?.coursePopularity || []).map((c: any) => ({
      courseId: c.course_id,
      courseCode: c.course_code,
      courseName: c.course_name,
      studentCount: c.student_count,
      assignmentCount: c.assignment_count,
      submissionCount: c.submission_count,
      averageGrade: c.average_grade
        ? Number(c.average_grade)
        : null,
    })),
  };
}


export default function AdminAnalyticsScreen(){
  const [overview, setOverview] = useState<any>(null);
 const [courses, setCourses] = useState<CoursePopularity[]>([]);
  const [loading, setLoading] = useState(true);


useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          "https://YOUR_DOMAIN.com/api/admin/analytics"
        );
        const json = await res.json();
        const parsed = parseAnalyticsResponse(json);

        setOverview(parsed.overview);
        setCourses(parsed.courses);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);



return(<ScrollView style={styles.container}>
    <Text style={styles.title}>Analytics Dashboard</Text>
    <View style={styles.card}>
    
        <View style={styles.row}>
          <Feather name="users" size={20} />
          <Text style={styles.label}>Total Users</Text>
          
              </View>
    <Text style={styles.value}>{overview.totalUsers}</Text>
          <Text style={styles.sub}>{overview.activeUsers} active</Text>
   
    
    <View style={styles.card}>
        <View style={styles.row}>
          <Feather name="book-open" size={20} />
          <Text style={styles.label}>Courses</Text>
        </View>
      
        <Text style={styles.value}>{overview.totalCourses}</Text>
        <Text style={styles.sub}>{overview.activeCourses} active</Text>
      
      </View>



<View style={styles.card}>
        <View style={styles.row}>
          <Feather name="file-text" size={20} />
          <Text style={styles.label}>Assignments</Text>
        </View>
                <Text style={styles.value}>{overview.totalAssignments}</Text>
        <Text style={styles.sub}>
          {overview.publishedAssignments} published
        </Text>
  </View>

 <View style={styles.card}>
    <View style={styles.row}>
          <Feather name="check-circle" size={20} />
          <Text style={styles.label}>Submissions</Text>
        </View>
        <Text style={styles.value}>{overview.totalSubmissions}</Text>
    <Text style={styles.sub}>
          {overview.gradedSubmissions} graded
        </Text>
    </View>

 <Text style={styles.section}>Course Popularity</Text>

{courses.map((c) => (
        <View key={c.courseId} style={styles.courseCard}>
          <Text style={styles.courseCode}>{c.courseCode}</Text>
          <Text>{c.courseName}</Text>
          <Text>Students: {c.studentCount}</Text>
          <Text>Assignments: {c.assignmentCount}</Text>
          <Text>
            Avg Grade:{" "}
            {c.averageGrade !== null
              ? `${c.averageGrade.toFixed(1)}%`
              : "N/A"}
          </Text>
        </View>
      ))}




    </View>

       </ScrollView>)


}

const styles = StyleSheet.create({
    container:{flex:1,backgroundColor:"#F4F6F8",padding:16},
    title:{fontSize:22,fontWeight:"700",marginBottom:16},
    row:{flexDirection:"row",alignItems:"center",gap:8},
    courseCard:{backgroundColor:"#FFF",padding:14,borderRadius:10,marginBottom:10},
    label:{fontSize:14,color:"#555",},
    value:{fontSize:14,color:"#555"},
    sub:{fontSize:12,color:"#888"},
    courseCode:{fontWeight:"700"},
    section:{fontSize:18,fontWeight:"600",marginVertical:12},
    card:{backgroundColor:"#FFF",padding:16,borderRadius:12,marginBottom:12},
});
