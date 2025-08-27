"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data - in production, you would fetch this from your database
const memberActivityData = [
  { name: "Jan", workouts: 65, attendance: 78, xp: 420 },
  { name: "Feb", workouts: 59, attendance: 70, xp: 380 },
  { name: "Mar", workouts: 80, attendance: 89, xp: 510 },
  { name: "Apr", workouts: 81, attendance: 86, xp: 535 },
  { name: "May", workouts: 56, attendance: 65, xp: 400 },
  { name: "Jun", workouts: 55, attendance: 68, xp: 390 },
  { name: "Jul", workouts: 40, attendance: 58, xp: 300 },
  { name: "Aug", workouts: 72, attendance: 82, xp: 480 },
  { name: "Sep", workouts: 78, attendance: 85, xp: 520 },
  { name: "Oct", workouts: 85, attendance: 10, xp: 150 },
];

interface UserDistributionData {
  name: string;
  value: number;
  color: string;
}

interface LevelDistributionData {
  name: string;
  value: number;
  color: string;
}

const popularExercisesData = [
  { name: "Bench Press", count: 320 },
  { name: "Squats", count: 280 },
  { name: "Deadlift", count: 250 },
  { name: "Pull Ups", count: 210 },
  { name: "Shoulder Press", count: 190 },
];

const userActivityByTimeData = [
  { time: "6-8 AM", users: 25 },
  { time: "8-10 AM", users: 40 },
  { time: "10-12 PM", users: 30 },
  { time: "12-2 PM", users: 45 },
  { time: "2-4 PM", users: 50 },
  { time: "4-6 PM", users: 70 },
  { time: "6-8 PM", users: 90 },
  { time: "8-10 PM", users: 65 },
];

const GymDashboardCharts = () => {
  const [timeframe, setTimeframe] = useState("monthly");

  const [userDistributionData, setUserDistributionData] = useState<
    UserDistributionData[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDistribution = async () => {
      try {
        const response = await fetch("/api/user-distribution");
        const result = await response.json();

        if (result.success) {
          setUserDistributionData(result.data);
        } else {
          console.error("Failed to fetch user distribution:", result.error);
          // Fallback to mock data
          setUserDistributionData([
            { name: "Mobile Only Users", value: 35, color: "#8884d8" },
            { name: "Gym Members with Mobile", value: 65, color: "#82ca9d" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching user distribution:", error);
        // Fallback to mock data
        setUserDistributionData([
          { name: "Mobile Only Users", value: 35, color: "#8884d8" },
          { name: "Gym Members with Mobile", value: 65, color: "#82ca9d" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDistribution();
  }, []);

  //------------------------------------------------------------------------
  const [memberRegistrationsData, setMemberRegistrationsData] = useState<
    { name: string; registrations: number }[]
  >([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [totals, setTotals] = useState({
    totalRegistrations: 0,
    currentPeriodRegistrations: 0,
  });

  const fetchMemberRegistrations = async (timeframe: string) => {
    try {
      setLoadingRegistrations(true);
      const response = await fetch(
        `/api/member-registrations?timeframe=${timeframe}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setMemberRegistrationsData(result.data);
        setTotals({
          totalRegistrations: result.totals.totalRegistrations,
          currentPeriodRegistrations: result.totals.currentPeriodRegistrations,
        });
      } else {
        console.error("Failed to fetch member registrations:", result.error);
        setMemberRegistrationsData([]);
        setTotals({ totalRegistrations: 0, currentPeriodRegistrations: 0 });
      }
    } catch (error) {
      console.error("Error fetching member registrations:", error);
      setMemberRegistrationsData([]);
      setTotals({ totalRegistrations: 0, currentPeriodRegistrations: 0 });
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    fetchMemberRegistrations(timeframe);
  }, [timeframe]);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  //---------------------------------------------------------------------------------------------------------------------------

  const [levelDistributionData, setLevelDistributionData] = useState<
    LevelDistributionData[]
  >([]);
  const [levelLoading, setLevelLoading] = useState(true);

  useEffect(() => {
    const fetchLevelDistribution = async () => {
      try {
        const response = await fetch("/api/level-distribution");
        const result = await response.json();

        if (result.success) {
          setLevelDistributionData(result.data);
        } else {
          console.error("Failed to fetch level distribution:", result.error);
          // Fallback to mock data
          setLevelDistributionData([
            { name: "Level 1", value: 45, color: "#8884d8" },
            { name: "Level 2", value: 32, color: "#83a6ed" },
            { name: "Level 3", value: 18, color: "#8dd1e1" },
            { name: "Level 4", value: 8, color: "#82ca9d" },
            { name: "Level 5+", value: 5, color: "#a4de6c" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching level distribution:", error);
        // Fallback to mock data
        setLevelDistributionData([
          { name: "Level 1", value: 45, color: "#8884d8" },
          { name: "Level 2", value: 32, color: "#83a6ed" },
          { name: "Level 3", value: 18, color: "#8dd1e1" },
          { name: "Level 4", value: 8, color: "#82ca9d" },
          { name: "Level 5+", value: 5, color: "#a4de6c" },
        ]);
      } finally {
        setLevelLoading(false);
      }
    };

    fetchLevelDistribution();
  }, []);

  //---------------------------------------------------------------------------------------------------------------------------
  return (
    <div className="grid gap-4">
      {/* Top Row - Main Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* XP and Leveling Chart */}

        {/* Member Registrations */}

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Member Registrations</CardTitle>

              <CardDescription>
                {timeframe === "weekly"
                  ? "New members joined per week"
                  : timeframe === "yearly"
                  ? "New members joined per year"
                  : "New members joined per month"}
              </CardDescription>
            </div>

            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingRegistrations ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-sm text-muted-foreground">
                  Loading registration data...
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={memberRegistrationsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `${value} registrations`,
                        "Registrations",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#8884d8"
                      name="Registrations"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Summary Stats */}
                <div className="flex justify-between mt-6 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {totals.totalRegistrations}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Members
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {/* {totals.currentMonthRegistrations} */}
                      {totals.currentPeriodRegistrations}
                    </p>
                    {/* <p className="text-sm text-muted-foreground">This Month</p> */}
                    <p className="text-sm text-muted-foreground">
                      {timeframe === "weekly"
                        ? "This Week"
                        : timeframe === "yearly"
                        ? "This Year"
                        : "This Month"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {memberRegistrationsData.length > 1
                        ? `${Math.round(
                            (totals.currentPeriodRegistrations /
                              (memberRegistrationsData[
                                memberRegistrationsData.length - 2
                              ].registrations || 1)) *
                              100
                          )}%`
                        : "0%"}
                    </p>
                    <p className="text-sm text-muted-foreground">Growth</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ----------------------------user destribution------------------ */}

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Mobile vs Gym Member breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} users`, name]}
                  labelFormatter={() => ""}
                />
              </PieChart>
            </ResponsiveContainer>
            {loading && (
              <div className="flex justify-center items-center h-48">
                <div className="text-sm text-muted-foreground">
                  Loading user distribution...
                </div>
              </div>
            )}
            {/* Legend */}
            {!loading && userDistributionData.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                {userDistributionData.map((entry, index) => (
                  <div
                    key={`legend-${index}`}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}: {entry.value} users
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row - Analysis Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Popular Exercises */}
        <Card>
          <CardHeader>
            <CardTitle>Top Exercises</CardTitle>
            <CardDescription>
              Most popular exercises among members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={popularExercisesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Usage Count"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Level Distribution */}

        <Card>
          <CardHeader>
            <CardTitle>Level Distribution</CardTitle>
            <CardDescription>Member levels breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={levelDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {levelDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} members`, name]}
                  labelFormatter={() => ""}
                />
              </PieChart>
            </ResponsiveContainer>
            {levelLoading && (
              <div className="flex justify-center items-center h-48">
                <div className="text-sm text-muted-foreground">
                  Loading level distribution...
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gym Traffic by Time */}
        <Card>
          <CardHeader>
            <CardTitle>Gym Traffic</CardTitle>
            <CardDescription>Members by time of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={userActivityByTimeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="time" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="users"
                  name="Members"
                  fill="#82ca9d"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Detailed Activity Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
          <CardDescription>
            Workouts, exercises, and leveling metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workouts">
            <TabsList className="mb-4">
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="exercises">Exercise Types</TabsTrigger>
              <TabsTrigger value="leveling">Leveling Progress</TabsTrigger>
            </TabsList>
            <TabsContent value="workouts" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={memberActivityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    stroke="#ff7300"
                    name="Workouts Completed"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="exercises" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { category: "Cardio", count: 420 },
                    { category: "Strength", count: 680 },
                    { category: "Flexibility", count: 230 },
                    { category: "Balance", count: 180 },
                    { category: "HIIT", count: 310 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Exercise Count"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="leveling" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", newLevelUps: 24 },
                    { month: "Feb", newLevelUps: 18 },
                    { month: "Mar", newLevelUps: 32 },
                    { month: "Apr", newLevelUps: 27 },
                    { month: "May", newLevelUps: 21 },
                    { month: "Jun", newLevelUps: 19 },
                    { month: "Jul", newLevelUps: 16 },
                    { month: "Aug", newLevelUps: 28 },
                    { month: "Sep", newLevelUps: 31 },
                    { month: "Oct", newLevelUps: 35 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newLevelUps"
                    stroke="#82ca9d"
                    name="New Level Ups"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymDashboardCharts;
