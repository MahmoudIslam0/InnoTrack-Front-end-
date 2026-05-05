"use client";

import { useState } from "react";
import { User, Mail, BookOpen, Award, LogOut, Phone, Pencil, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function StudentProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@university.edu",
    phone: "+1 (555) 123-4567",
    studentId: "STU-2023-4567",
    department: "Computer Science",
    major: "Software Engineering",
    currentYear: "4th Year",
    enrollmentDate: "09/01/2023",
    expectedGraduation: "06/30/2027",
    gpa: "3.8",
    skills: ["React", "Node.js", "Python", "Machine Learning"],
  });

  const [editForm, setEditForm] = useState({
    phone: profile.phone,
    gpa: profile.gpa,
    major: profile.major,
    skills: profile.skills.join(", "),
  });

  const handleSave = () => {
    setProfile({
      ...profile,
      phone: editForm.phone,
      gpa: editForm.gpa,
      major: editForm.major,
      skills: editForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      phone: profile.phone,
      gpa: profile.gpa,
      major: profile.major,
      skills: profile.skills.join(", "),
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel} className="rounded-lg">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card text-card-foreground rounded-2xl border border-border/60 p-6 shadow-sm flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white shadow-md mb-5">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{profile.studentId}</p>
              <Badge variant="secondary" className="mt-4 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 px-3 py-1 text-xs font-medium">
                {profile.department}
              </Badge>

              <div className="w-full mt-8 space-y-3">
                <div className="flex items-center p-3.5 rounded-xl bg-slate-50 dark:bg-muted/30 border border-border/50 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-3 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center p-3.5 rounded-xl bg-slate-50 dark:bg-muted/30 border border-border/50 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-3 shrink-0" />
                  <span className="truncate">{isEditing ? editForm.phone : profile.phone}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full mt-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl h-11"
                onClick={() => router.push("/login")}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Right Column: Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card text-card-foreground rounded-2xl border border-border/60 p-7 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                <User className="w-5 h-5 mr-3 text-indigo-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Full Name</Label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                    {profile.firstName} {profile.lastName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Email Address</Label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                    {profile.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="px-4 py-3 h-[44px] rounded-xl border-indigo-200 focus-visible:ring-indigo-500 bg-white dark:bg-background"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                      {profile.phone}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Student ID</Label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                    {profile.studentId}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-card text-card-foreground rounded-2xl border border-border/60 p-7 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-3 text-indigo-500" />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Department</Label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                    {profile.department}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">GPA</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.gpa}
                      onChange={(e) => setEditForm({ ...editForm, gpa: e.target.value })}
                      className="px-4 py-3 h-[44px] rounded-xl border-indigo-200 focus-visible:ring-indigo-500 bg-white dark:bg-background"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                      {profile.gpa}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Major</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.major}
                      onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                      className="px-4 py-3 h-[44px] rounded-xl border-indigo-200 focus-visible:ring-indigo-500 bg-white dark:bg-background"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                      {profile.major}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Current Year</Label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                    {profile.currentYear}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Enrollment Date</Label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                    {profile.enrollmentDate}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Expected Graduation</Label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm text-muted-foreground min-h-[44px]">
                    {profile.expectedGraduation}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-card text-card-foreground rounded-2xl border border-border/60 p-7 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                <Award className="w-5 h-5 mr-3 text-indigo-500" />
                Skills & Expertise
              </h3>
              {isEditing ? (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Technical Skills (comma separated)</Label>
                  <Input
                    value={editForm.skills}
                    onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, Python"
                    className="px-4 py-3 h-[44px] rounded-xl border-indigo-200 focus-visible:ring-indigo-500 bg-white dark:bg-background"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 min-h-[44px] items-center">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-2 px-4 rounded-lg font-medium text-sm border-0">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No skills listed</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
