"use client";

import { useState } from "react";
import { Camera, Save } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { professorProfile } from "../_data";
import { PageHeader, SectionCard } from "../_components";

export default function ProfessorProfile() {
  const [profile, setProfile] = useState(professorProfile);

  const updateProfile = (field: keyof typeof professorProfile, value: string) => {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
  };

  return (
    <div className="p-4 md:p-8 max-w-350 mx-auto">
      <PageHeader
        title="Profile Management"
        description="View and edit professor department, specialization, and profile picture details."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SectionCard title="Professor Profile">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-28 h-28 mb-4">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-3xl">
                  {profile.profilePicture}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="border-indigo-200 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/100/10 mb-5"
              >
                <Camera className="w-4 h-4 mr-2" />
                Update Picture
              </Button>
              <h2 className="text-lg font-semibold text-foreground">
                {profile.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{profile.department}</p>
              <p className="text-sm text-muted-foreground mt-1">{profile.office}</p>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard title="Editable Details">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(event) =>
                      updateProfile("name", event.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(event) =>
                      updateProfile("email", event.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(event) =>
                      updateProfile("department", event.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="office">Office</Label>
                  <Input
                    id="office"
                    value={profile.office}
                    onChange={(event) =>
                      updateProfile("office", event.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Textarea
                  id="specialization"
                  value={profile.specialization}
                  onChange={(event) =>
                    updateProfile("specialization", event.target.value)
                  }
                  className="mt-1 min-h-24"
                />
              </div>

              <div>
                <Label htmlFor="profilePicture">Profile Initials</Label>
                <Input
                  id="profilePicture"
                  value={profile.profilePicture}
                  onChange={(event) =>
                    updateProfile(
                      "profilePicture",
                      event.target.value.slice(0, 2).toUpperCase(),
                    )
                  }
                  className="mt-1 max-w-40"
                />
              </div>

              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
