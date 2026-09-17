import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { User, Mail, Phone, MapPin, ShieldCheck, Edit, Save, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "Citizen User",
    email: user?.email || "citizen@aram.org",
    phone: user?.phone || "+91 9876543210",
    district: "Coimbatore",
    language: "Tamil & English"
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile details updated successfully.");
  };

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#18332B] tracking-tight">Citizen Profile</h1>
            <p className="text-xs text-[#65736D]">Manage your personal details and communication preferences.</p>
          </div>
          <Button
            variant={isEditing ? "primary" : "cream"}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            icon={isEditing ? Save : Edit}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-[#E6E1D8] pb-6">
            <div className="w-16 h-16 rounded-full bg-[#163D32] text-white flex items-center justify-center font-bold text-xl">
              {profile.name[0]}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18332B]">{profile.name}</h3>
              <p className="text-xs text-[#65736D]">{profile.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DCEBDD] text-[#163D32]">
                Verified Citizen Identity
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.name}
              disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              icon={User}
            />
            <Input
              label="Email Address"
              value={profile.email}
              disabled={true}
              icon={Mail}
            />
            <Input
              label="Mobile Number"
              value={profile.phone}
              disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              icon={Phone}
            />
            <Input
              label="District / Taluk"
              value={profile.district}
              disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              icon={MapPin}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
