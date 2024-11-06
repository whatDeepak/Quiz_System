"use client";

import React, { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UpdateDialog } from "@/components/dashboard/update-dialog";
import { db } from "@/lib/db";
import  CalendarDateRangePicker  from "../../../_components/date-range-picker";
import DoughnutChart from "../../../_components/doughnutChart";
import { redirect } from "next/navigation";
import DashboardCoursesCard from "./_components/dashboard-courses";
import { trackUserActivity } from "@/lib/trackUserActivity";
import axios from "axios";
import toast from "react-hot-toast";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  USER = "USER",
}

interface CategoryData {
  category: string;
  percentage: number;
}

const Dashboard = () => {
  const user = useCurrentUser();
  const [showDialog, setShowDialog] = useState(false);
  const [chartData, setChartData] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [checkInShown, setCheckInShown] = useState(false);
  const [checkInDates, setCheckInDates] = React.useState<string[]>([]);

  if (!user) {
    redirect("/");
  }
  useEffect(() => {
    const checkRollNo = () => {
      try {
        if (user && user?.role === UserRole.USER && user.rollNo === "") {
          setShowDialog(true);
        } else {
          setShowDialog(false);
        }
      } catch (error) {
        console.error("Error checking rollNo:", error);
      }
    };
    checkRollNo();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/analytics/doughnutData?userId=${user.id}`
        );
        const data = await response.json();

        if (response.ok) {
          setChartData({ labels: data.labels, data: data.data });
        } else {
          console.error("Failed to fetch chart data:", data.error);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };
    const dailyCheckIn=async () => {
     
      try {
           const response= await axios.post(`/api/user/trackUserActivity`);
           setCheckInDates(response.data.checkInDates);
          if(response.data.message==="First time" && !checkInShown){
         toast.success("Daily Check-in");
            setCheckInShown(true);
          }
      } catch (error) {
          console.error("Error tracking daily check-In progress:", error);
      }
   
    }

    fetchData();
   dailyCheckIn();
  }, [user.id,checkInShown]);
  
  const handleCloseDialog = () => {
    // Close the Dialog
    setShowDialog(false);
  };

  return (
    <>
      {showDialog && user && (
        <UpdateDialog onClose={() => setShowDialog(false)} userId={user?.id} />
      )}
      <div className="flex flex-col md:flex-row">
        {/* Main content area */}
        <div className="flex-1 p-4 space-y-6 md:mr-72">
          <DashboardCoursesCard userId={user.id!} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
