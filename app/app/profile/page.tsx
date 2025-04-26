"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Loader2, FileText, FileEdit, Eye, Trash2 } from "lucide-react";
import {
  User,
  Education as PrismaEducation,
  Experience as PrismaExperience,
  Skill,
} from "@prisma/client";
import Image from 'next/image';
import { remark } from "remark";
import html from "remark-html";
import toast from "react-hot-toast";

// Create frontend-friendly types for dates
type Education = Omit<PrismaEducation, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string | null;
  presentDate: string | null;
};

type Experience = Omit<PrismaExperience, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string | null;
  presentDate: string | null;
};

// Create form-specific types that don't require userId (server will add it)
type EducationForm = Omit<Education, "userId"> & {
  userId?: string;
};

type ExperienceForm = Omit<Experience, "userId"> & {
  userId?: string;
};

// Create a Profile type that extends User but excludes sensitive fields and includes related collections
type Profile = Omit<
  User,
  "password" | "emailVerified" | "createdAt" | "updatedAt"
> & {
  education: Education[];
  experience: Experience[];
  skills: Skill[];
};

type CV = {
  id: string;
  fileName: string;
  content: string;
  createdAt: string;
};

/**
 * Komponen Modal sederhana
 */
function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white p-6 rounded-lg z-10 w-full max-w-2xl mx-4 my-6 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}



export default function ProfilePage() {
  const { data: session, update } = useSession();

  // State untuk data profil
  const [profile, setProfile] = useState<Profile | null>(null);

  // State modal
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openAddEducationModal, setOpenAddEducationModal] = useState(false);
  const [openEditEducationModal, setOpenEditEducationModal] = useState(false);

  const [openAddExperienceModal, setOpenAddExperienceModal] = useState(false);
  const [openEditExperienceModal, setOpenEditExperienceModal] = useState(false);
  const [expForms, setExpForms] = useState<Experience[]>([]);

  const [openAddSkillModal, setOpenAddSkillModal] = useState(false);
  const [openEditSkillModal, setOpenEditSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [newSkillForm, setNewSkillForm] = useState<{ skillName: string }>({
    skillName: "",
  });

  // Add these state variables inside your ProfilePage component
const [cvs, setCvs] = useState<CV[]>([]);
const [openAddCVModal, setOpenAddCVModal] = useState(false);
const [openViewCVModal, setOpenViewCVModal] = useState(false);
const [selectedCV, setSelectedCV] = useState<CV | null>(null);
const [isUploadingCV, setIsUploadingCV] = useState(false);
const [newCVForm, setNewCVForm] = useState({
  fileName: "",
});
const fileInputRef = useRef<HTMLInputElement>(null);
const [cvFile, setCVFile] = useState<File | null>(null);
const [parsedCVContent, setParsedCVContent] = useState("");

// Add these new state variables for CV editing
const [openEditCVModal, setOpenEditCVModal] = useState(false);
const [editingCV, setEditingCV] = useState<CV | null>(null);
const [editCVForm, setEditCVForm] = useState({
  fileName: "",
  content: ""
});
const [isSavingCV, setIsSavingCV] = useState(false);


  // State form untuk update profil
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    employment: "",
    about: "",
    image: "",
  });

  // State form untuk update education
  const [eduForms, setEduForms] = useState<EducationForm[]>([]);
  const [newEduForm, setNewEduForm] = useState<EducationForm>({
    id: -1,
    degree: "",
    institutionName: "",
    startDate: "",
    endDate: null,
    presentDate: null,
  });
  
  const [newExpForm, setNewExpForm] = useState<ExperienceForm>({
    id: -1,
    companyName: "",
    role: "",
    skills: "",
    startDate: "",
    endDate: null,
    presentDate: null,
    responsibilities: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      if (session?.user) {
        try {
          const res = await fetch("/api/profile");
          
          if (!res.ok) {
            // Don't try to consume the response body with text()
            console.error("Failed to fetch profile:", res.status, res.statusText);
            return;
          }
  
          // The API response already has dates as strings
          const data = await res.json();
          
          // Ensure proper typing with the presentDate field
          const typedProfile: Profile = {
            ...data,
            education: data.education?.map((edu: any) => ({
              ...edu,
              // Ensure these fields exist even if null
              startDate: edu.startDate || "",
              endDate: edu.endDate || null,
              presentDate: edu.presentDate || null
            })) || [],
            experience: data.experience?.map((exp: any) => ({
              ...exp,
              // Ensure these fields exist even if null
              startDate: exp.startDate || "",
              endDate: exp.endDate || null,
              presentDate: exp.presentDate || null
            })) || [],
            skills: data.skills || [],
          };
  
          setProfile(typedProfile);
  
          // Set form data
          setProfileForm({
            name: data.name || "",
            email: data.email || "",
            employment: data.employment || "",
            about: data.about || "",
            image: data.image || "",
          });
  
          // Set education forms with properly typed data
          setEduForms(
            typedProfile.education.map((edu) => ({
              ...edu,
            }))
          );
          
          // Set experience forms with properly typed data
          setExpForms(
            typedProfile.experience.map((exp) => ({
              ...exp,
            }))
          );
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
    }
    fetchProfile();
  }, [session]);

  // Replace the handleProfileUpdate function
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Call the API directly without ID in the path
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setOpenProfileModal(false);

      // Update the session with new data
      await update({
        user: {
          ...session?.user,
          name: updated.name,
          email: updated.email,
          image: updated.image,
        },
      });
    } else {
      console.error("Gagal memperbarui profil");
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/profile/education`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        degree: newEduForm.degree,
        institutionName: newEduForm.institutionName,
        startDate: newEduForm.startDate,
        endDate: newEduForm.endDate,
        presentDate: newEduForm.presentDate
      }),
    });
  
    if (res.ok && profile) {
      const newEducation = await res.json();
      setProfile({
        ...profile,
        education: [...profile.education, newEducation],
      });
      setOpenAddEducationModal(false);
  
      // Reset form
      setNewEduForm({
        id: -1,
        degree: "",
        institutionName: "",
        startDate: "",
        endDate: null,
        presentDate: null
      });
    } else {
      console.error("Failed to add education data");
    }
  };

  const handleEducationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates = eduForms.map(async (edu) => {
      // For new education entries
      if (edu.id < 0) {
        const res = await fetch(`/api/profile/education`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            degree: edu.degree,
            institutionName: edu.institutionName,
            startDate: edu.startDate,
            endDate: edu.endDate,
            presentDate: edu.presentDate
          }),
        });
        if (!res.ok) {
          console.error("Failed to add education data");
        }
        return res.ok ? await res.json() : null;
      }
      // For existing education entries
      else {
        const res = await fetch(`/api/profile/education`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: edu.id,
            degree: edu.degree,
            institutionName: edu.institutionName,
            startDate: edu.startDate,
            endDate: edu.endDate,
            presentDate: edu.presentDate
          }),
        });
        if (!res.ok) {
          console.error("Failed to update education data");
        }
        return res.ok ? await res.json() : null;
      }
    });
  
    const updatedEducations = (await Promise.all(updates)).filter(
      Boolean
    ) as Education[];
  
    setProfile((prevProfile) =>
      prevProfile ? { ...prevProfile, education: updatedEducations } : null
    );
    setOpenEditEducationModal(false);
  };

  const handleEducationDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/profile/education?id=${id}`, {
        method: "DELETE",
      });
  
      if (res.ok && profile) {
        const updatedProfile: Profile = {
          ...profile,
          education: profile.education.filter((edu) => edu.id !== id),
        };
        setProfile(updatedProfile);
        toast.success("Education deleted successfully");
      } else {
        toast.error("Failed to delete education data");
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("Failed to delete education data");
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/profile/experience`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: newExpForm.companyName,
          role: newExpForm.role,
          skills: newExpForm.skills,
          startDate: newExpForm.startDate,
          endDate: newExpForm.endDate,
          presentDate: newExpForm.presentDate,
          responsibilities: newExpForm.responsibilities,
        }),
      });
    
      if (res.ok && profile) {
        const newExperience = await res.json();
        setProfile({
          ...profile,
          experience: [...profile.experience, newExperience],
        });
        setOpenAddExperienceModal(false);
        
        toast.success("Experience added successfully!");
    
        // Reset the form
        setNewExpForm({
          id: -1,
          companyName: "",
          role: "",
          skills: "",
          startDate: "",
          endDate: null,
          presentDate: null,
          responsibilities: "",
        });
      } else {
        toast.error("Failed to add experience data");
      }
    } catch (error) {
      console.error("Failed to add experience:", error);
      toast.error("Failed to add experience data");
    }
  };

  const handleExperienceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates = expForms.map(async (exp) => {
      // For new experience entries
      if (exp.id < 0) {
        const res = await fetch(`/api/profile/experience`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: exp.companyName,
            role: exp.role,
            skills: exp.skills,
            startDate: exp.startDate,
            endDate: exp.endDate,
            presentDate: exp.presentDate,
            responsibilities: exp.responsibilities,
          }),
        });
        if (!res.ok) {
          console.error("Failed to add experience data");
        }
        return res.ok ? await res.json() : null;
      }
      // For existing experience entries
      else {
        const res = await fetch(`/api/profile/experience`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: exp.id,
            companyName: exp.companyName,
            role: exp.role,
            skills: exp.skills,
            startDate: exp.startDate,
            endDate: exp.endDate,
            presentDate: exp.presentDate,
            responsibilities: exp.responsibilities,
          }),
        });
        if (!res.ok) {
          console.error("Failed to update experience data");
        }
        return res.ok ? await res.json() : null;
      }
    });
  
    const updatedExperiences = (await Promise.all(updates)).filter(
      Boolean
    ) as Experience[];
    
    setProfile((prevProfile) =>
      prevProfile
        ? {
            ...prevProfile,
            experience: updatedExperiences,
          }
        : null
    );
    setOpenEditExperienceModal(false);
  };

  // Add this handler function
  const handleExperienceDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/profile/experience?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok && profile) {
        const updatedProfile: Profile = {
          ...profile,
          experience: profile.experience.filter((exp) => exp.id !== id),
        };
        setProfile(updatedProfile);
        toast.success("Experience deleted successfully");
      } else {
        toast.error("Failed to delete experience data");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("Failed to delete experience data");
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/profile/skill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillName: newSkillForm.skillName,
      }),
    });

    if (res.ok && profile) {
      const newSkill = await res.json();
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill],
      });
      setOpenAddSkillModal(false);
      setNewSkillForm({ skillName: "" });
    } else {
      console.error("Gagal menambah skill");
    }
  };

  const handleEditSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;

    const res = await fetch(`/api/profile/skill`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedSkill.id,
        skillName: selectedSkill.skillName,
      }),
    });

    if (res.ok && profile) {
      const updatedSkill = await res.json();
      setProfile({
        ...profile,
        skills: profile.skills.map((skill) =>
          skill.id === updatedSkill.id ? updatedSkill : skill
        ),
      });
      setOpenEditSkillModal(false);
      setSelectedSkill(null);
    } else {
      console.error("Gagal memperbarui skill");
    }
  };

  const handleDeleteSkill = async (id: number) => {
    const res = await fetch(`/api/profile/skill?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok && profile) {
      setProfile({
        ...profile,
        skills: profile.skills.filter((skill) => skill.id !== id),
      });
    } else {
      console.error("Gagal menghapus skill");
    }
  };

  // Add this to your useEffect that fetches profile data
useEffect(() => {
  async function fetchCVs() {
    if (session?.user) {
      try {
        const res = await fetch("/api/cv");
        if (!res.ok) {
          console.error("Failed to fetch CVs:", res.status, res.statusText);
          return;
        }
        
        const data = await res.json();
        setCvs(data.cvs || []);
      } catch (error) {
        console.error("Error fetching CV data:", error);
      }
    }
  }
  
  fetchCVs();
}, [session]);

// Add these handlers for CV operations
const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0] || null;
  if (selectedFile) {
    // Check if file is PDF
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }


    setCVFile(selectedFile);
    

  }
};

const handleAddCV = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!cvFile) {
    toast.error("Please select a file");
    return;
  }

  setIsUploadingCV(true);

  try {
    // Create FormData
    const formData = new FormData();
    formData.append("file", cvFile);
    formData.append("fileName", newCVForm.fileName);

    // Send to API
    const response = await fetch("/api/cv/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload CV");
    }

    const data = await response.json();

    // Add the new CV to the list
    const newCV = {
      id: data.id,
      fileName: newCVForm.fileName,
      content: "",
      createdAt: new Date().toISOString()
    };
    
    setCvs([newCV, ...cvs]);
    setOpenAddCVModal(false);
    
    // Reset form
    setNewCVForm({
      fileName: "",
    });
    setCVFile(null);
    
    // Show success message
    toast.success("CV uploaded successfully!");
  } catch (error) {
    console.error("Error uploading CV:", error);
    toast.error("Failed to upload CV. Please try again.");
  } finally {
    setIsUploadingCV(false);
  }
};

// Add this function to parse the Markdown content
const parseMarkdown = (content: string) => {
  return remark().use(html).processSync(content).toString();
};

// Update the handleViewCV function to parse the content
const handleViewCV = async (cv: CV) => {
  setSelectedCV(cv);
  setOpenViewCVModal(true);
  
  // If we don't have the content yet, fetch it
  if (!cv.content) {
    try {
      const res = await fetch(`/api/cv/${cv.id}`);
      
      if (!res.ok) {
        console.error("Failed to fetch CV content");
        return;
      }
      
      const data = await res.json();
      const content = data.cv.content || data.cv.originalContent;
      
      // Update the CV in our list with the content
      setCvs(prevCVs => prevCVs.map(c => 
        c.id === cv.id ? {...c, content} : c
      ));
      
      // Also update the selected CV and parse the content
      setSelectedCV({...cv, content});
      
      try {
        const parsedContent = parseMarkdown(content);
        setParsedCVContent(parsedContent);
      } catch (error) {
        console.error("Error parsing CV content:", error);
      }
    } catch (error) {
      console.error("Error fetching CV content:", error);
    }
  } else {
    // Parse the content if it already exists
    try {
      const parsedContent = parseMarkdown(cv.content);
      setParsedCVContent(parsedContent);
    } catch (error) {
      console.error("Error parsing CV content:", error);
    }
  }
};

const handleDeleteCV = async (id: string) => {
  if (!confirm("Are you sure you want to delete this CV?")) {
    return;
  }
  
  try {
    const res = await fetch(`/api/cv/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setCvs(cvs.filter(cv => cv.id !== id));
      toast.success("CV deleted successfully");
    } else {
      console.error("Failed to delete CV");
      toast.error("Failed to delete CV");
    }
  } catch (error) {
    console.error("Error deleting CV:", error);
    toast.error("Error deleting CV");
  }
};

// Add a handler for editing CV
const handleEditCV = async (cv: CV) => {
  setEditingCV(cv);
  
  // If we don't have the content yet, fetch it
  if (!cv.content) {
    try {
      const res = await fetch(`/api/cv/${cv.id}`);
      
      if (!res.ok) {
        console.error("Failed to fetch CV content");
        return;
      }
      
      const data = await res.json();
      const content = data.cv.content || data.cv.originalContent;
      
      // Update the CV in our list with the content
      setCvs(prevCVs => prevCVs.map(c => 
        c.id === cv.id ? {...c, content} : c
      ));
      
      // Set the form data
      setEditCVForm({
        fileName: cv.fileName,
        content: content
      });
    } catch (error) {
      console.error("Error fetching CV content:", error);
    }
  } else {
    // Set the form data with existing content
    setEditCVForm({
      fileName: cv.fileName,
      content: cv.content
    });
  }
  
  setOpenEditCVModal(true);
};

// Add a handler for saving edited CV
const handleSaveEditedCV = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!editingCV) return;
  
  setIsSavingCV(true);
  
  try {
    // Update both CV content and filename in a single request
    const response = await fetch(`/api/cv/${editingCV.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: editCVForm.content,
        fileName: editCVForm.fileName
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update CV");
    }
    
    const { cv } = await response.json();
    
    // Update the CV in our list
    setCvs(prevCVs => prevCVs.map(c => 
      c.id === editingCV.id ? {
        ...c,
        fileName: cv.fileName,
        content: cv.content
      } : c
    ));
    
    // Close the modal
    setOpenEditCVModal(false);
    setEditingCV(null);
    
    // Show success message
    toast.success("CV updated successfully!");
  } catch (error) {
    console.error("Error updating CV:", error);
    toast.error("Failed to update CV. Please try again.");
  } finally {
    setIsSavingCV(false);
  }
};

  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      {/* Card 1: Profile */}
      <div className="border p-4 rounded shadow">
        <div className="flex items-center space-x-4">
          {profile.image ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image 
                src={profile.image}
                alt={profile.name || "Profile"}
                fill
                sizes="64px"
                className="object-cover"
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  console.log("Image failed to load, falling back to default");
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=random&size=64`;
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
              {(profile.name?.charAt(0) || "?").toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p>{profile.email}</p>
            <p>{profile.employment}</p>
          </div>
        </div>
        <p className="mt-2">{profile.about}</p>
        <button
          onClick={() => setOpenProfileModal(true)}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>
      </div>

      {/* Card: CV Management */}
<div className="border p-4 rounded shadow">
  <h2 className="text-xl font-bold mb-2">CV Management</h2>
  
  {cvs.length === 0 ? (
    <p className="text-gray-500 mb-4">You haven&apos;t uploaded any CVs yet.</p>
  ) : (
    <div className="space-y-2 mb-4">
      {cvs.map((cv) => (
        <div
          key={cv.id}
          className="border p-3 rounded flex justify-between items-center"
        >
          <div className="flex items-center">
            <FileText className="text-gray-500 mr-2" size={20} />
            <div>
              <p className="font-medium">{cv.fileName}</p>
              <p className="text-xs text-gray-500">
                {new Date(cv.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewCV(cv)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              title="View CV"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => handleEditCV(cv)}
              className="bg-amber-500 text-white p-2 rounded hover:bg-amber-600"
              title="Edit CV"
            >
              <FileEdit size={16} />
            </button>
            <button
              onClick={() => handleDeleteCV(cv.id)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              title="Delete CV"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
  
  <button
    onClick={() => setOpenAddCVModal(true)}
    className="bg-green-500 text-white px-4 py-2 rounded"
  >
    Add New CV
  </button>
</div>

      {/* Card 2: Education */}
      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Education</h2>
        {profile.education.map((edu) => (
          <div
            key={edu.id}
            className="border p-2 rounded mb-2 flex justify-between items-center"
          >
            <div>
              <p>
                <strong>Degree:</strong> {edu.degree}
              </p>
              <p>
                <strong>Institution:</strong> {edu.institutionName}
              </p>
              <p>
  {new Date(edu.startDate).toLocaleDateString()} - {" "}
  {edu.presentDate === "Present" 
    ? "Present" 
    : edu.endDate 
      ? new Date(edu.endDate).toLocaleDateString() 
      : ""}
</p>
            </div>
            <button
              onClick={() => handleEducationDelete(edu.id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        ))}
        <button
          onClick={() => setOpenAddEducationModal(true)}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Education
        </button>
        <button
          onClick={() => {
            setEduForms(profile.education); // Set eduForms with current education data
            setOpenEditEducationModal(true);
          }}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Edit Education
        </button>
      </div>

      {/* Card 3: Experience */}

      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Experience</h2>
        {profile.experience.map((exp) => (
          <div
            key={exp.id}
            className="border p-2 rounded mb-2 flex justify-between items-center"
          >
            <div>
              <p>
                <strong>Company:</strong> {exp.companyName}
              </p>
              <p>
                <strong>Role:</strong> {exp.role}
              </p>
              <p>
                <strong>Skills:</strong> {exp.skills}
              </p>
              <p>
  {new Date(exp.startDate).toLocaleDateString()} - {" "}
  {exp.presentDate === "Present" 
    ? "Present" 
    : exp.endDate 
      ? new Date(exp.endDate).toLocaleDateString() 
      : ""}
</p>
              <p>
                <strong>Responsibilities:</strong> {exp.responsibilities}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleExperienceDelete(exp.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <div className="flex space-x-2 mt-2">
          <button
            onClick={() => setOpenAddExperienceModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Experience
          </button>
          <button
            onClick={() => {
              setExpForms(profile.experience);
              setOpenEditExperienceModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit Experience
          </button>
        </div>
      </div>

      {/* Card 4: Skills */}
      <div className="border p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Skills</h2>
          <button
            onClick={() => setOpenAddSkillModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Skill
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(profile.skills || []).map((skill) => (
            <div
              key={skill.id}
              className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2"
            >
              <span>{skill.skillName}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedSkill(skill);
                    setOpenEditSkillModal(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {profile.skills?.length === 0 && (
            <p className="text-gray-500">No skills added yet</p>
          )}
        </div>
      </div>

      {/* Modal Update Profile */}
      <Modal
        isOpen={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
      >
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={profileForm.name}
            onChange={(e) =>
              setProfileForm({ ...profileForm, name: e.target.value })
            }
            className="w-full p-2 border rounded text-black"
          />
          <input
            type="email"
            placeholder="Email"
            value={profileForm.email}
            onChange={(e) =>
              setProfileForm({ ...profileForm, email: e.target.value })
            }
            className="w-full p-2 border rounded text-black"
          />
          <input
            type="text"
            placeholder="Employment"
            value={profileForm.employment}
            onChange={(e) =>
              setProfileForm({ ...profileForm, employment: e.target.value })
            }
            className="w-full p-2 border rounded text-black"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={profileForm.image}
            onChange={(e) =>
              setProfileForm({ ...profileForm, image: e.target.value })
            }
            className="w-full p-2 border rounded text-black"
          />
          <textarea
            placeholder="About"
            value={profileForm.about}
            onChange={(e) =>
              setProfileForm({ ...profileForm, about: e.target.value })
            }
            className="w-full p-2 border rounded text-black"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </form>
      </Modal>

      {/* Modal Add Education */}

      {/* Modal Add Education */}
      <Modal
  isOpen={openAddEducationModal}
  onClose={() => setOpenAddEducationModal(false)}
>
  <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
    <h2 className="text-xl font-bold">Add Education</h2>
  </div>

  <form onSubmit={handleAddEducation} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Degree
      </label>
      <input
        type="text"
        placeholder="Degree"
        value={newEduForm.degree}
        onChange={(e) =>
          setNewEduForm({ ...newEduForm, degree: e.target.value })
        }
        className="w-full p-2 border rounded text-black"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Institution Name
      </label>
      <input
        type="text"
        placeholder="Institution Name"
        value={newEduForm.institutionName}
        onChange={(e) =>
          setNewEduForm({
            ...newEduForm,
            institutionName: e.target.value,
          })
        }
        className="w-full p-2 border rounded text-black"
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={newEduForm.startDate}
          onChange={(e) =>
            setNewEduForm({ ...newEduForm, startDate: e.target.value })
          }
          className="w-full p-2 border rounded text-black"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date
        </label>
        <div className="space-y-2">
          <div className="flex items-center mb-2 text-black">
            <input
              type="checkbox"
              id="untilNowEdu"
              className="mr-2 text-black"
              checked={newEduForm.presentDate === "Present"}
              onChange={(e) => {
                if (e.target.checked) {
                  setNewEduForm({ 
                    ...newEduForm, 
                    presentDate: "Present",
                    endDate: null 
                  });
                } else {
                  setNewEduForm({ 
                    ...newEduForm, 
                    presentDate: null,
                    endDate: "" 
                  });
                }
              }}
            />
            <label htmlFor="untilNowEdu">Currently studying here</label>
          </div>

          {!newEduForm.presentDate && (
            <input
              type="date"
              value={newEduForm.endDate || ""}
              onChange={(e) =>
                setNewEduForm({ 
                  ...newEduForm, 
                  endDate: e.target.value,
                  presentDate: null 
                })
              }
              className="w-full p-2 border rounded text-black"
              required={!newEduForm.presentDate}
            />
          )}
        </div>
      </div>
    </div>

    <div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end space-x-4">
      <button
        type="button"
        onClick={() => setOpenAddEducationModal(false)}
        className="px-4 py-2 border rounded text-black"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  </form>
</Modal>

      {/* Modal Edit Education */}
      <Modal
  isOpen={openEditEducationModal}
  onClose={() => setOpenEditEducationModal(false)}
>
  <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
    <h2 className="text-xl font-bold text-black">Edit Education</h2>
  </div>

  <form onSubmit={handleEducationUpdate} className="space-y-6">
    {eduForms.map((edu, index) => (
      <div
        key={edu.id}
        className="p-4 border rounded-lg space-y-4 bg-gray-50"
      >
        <h3 className="font-semibold border-b pb-2 text-black">
          Education #{index + 1}
        </h3>

        <div className="space-y-4 text-black">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree
            </label>
            <input
              type="text"
              placeholder="Degree"
              value={edu.degree}
              onChange={(e) => {
                const newEduForms = [...eduForms];
                newEduForms[index].degree = e.target.value;
                setEduForms(newEduForms);
              }}
              className="w-full p-2 border rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              placeholder="Institution Name"
              value={edu.institutionName}
              onChange={(e) => {
                const newEduForms = [...eduForms];
                newEduForms[index].institutionName = e.target.value;
                setEduForms(newEduForms);
              }}
              className="w-full p-2 border rounded text-black"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={edu.startDate.split("T")[0]}
                onChange={(e) => {
                  const newEduForms = [...eduForms];
                  newEduForms[index].startDate = e.target.value;
                  setEduForms(newEduForms);
                }}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="space-y-2">
                <div className="flex items-center mb-2 text-black">
                  <input
                    type="checkbox"
                    id={`untilNowEduEdit-${index}`}
                    className="mr-2"
                    checked={edu.presentDate === "Present"}
                    onChange={(e) => {
                      const newEduForms = [...eduForms];
                      if (e.target.checked) {
                        newEduForms[index].presentDate = "Present";
                        newEduForms[index].endDate = null;
                      } else {
                        newEduForms[index].presentDate = null;
                        newEduForms[index].endDate = "";
                      }
                      setEduForms(newEduForms);
                    }}
                  />
                  <label htmlFor={`untilNowEduEdit-${index}`}>Present</label>
                </div>

                {!edu.presentDate && (
                  <input
                    type="date"
                    value={edu.endDate || ""}
                    onChange={(e) => {
                      const newEduForms = [...eduForms];
                      newEduForms[index].endDate = e.target.value;
                      newEduForms[index].presentDate = null;
                      setEduForms(newEduForms);
                    }}
                    className="w-full p-2 border rounded text-black"
                    required={!edu.presentDate}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}

    <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t flex justify-end space-x-4">
      <button
        type="button"
        onClick={() => setOpenEditEducationModal(false)}
        className="px-4 py-2 border rounded text-black"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save All Changes
      </button>
    </div>
  </form>
</Modal>

      {/* Modal Add Experience */}
      <Modal
  isOpen={openAddExperienceModal}
  onClose={() => setOpenAddExperienceModal(false)}
>
  <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
    <h2 className="text-xl font-bold">Add Experience</h2>
  </div>

  <form onSubmit={handleAddExperience} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Company Name
      </label>
      <input
        type="text"
        placeholder="Company Name"
        value={newExpForm.companyName}
        onChange={(e) =>
          setNewExpForm({ ...newExpForm, companyName: e.target.value })
        }
        className="w-full p-2 border rounded text-black"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Role
      </label>
      <input
        type="text"
        placeholder="Role"
        value={newExpForm.role}
        onChange={(e) =>
          setNewExpForm({ ...newExpForm, role: e.target.value })
        }
        className="w-full p-2 border rounded text-black"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Skills
      </label>
      <input
        type="text"
        placeholder="Skills"
        value={newExpForm.skills}
        onChange={(e) =>
          setNewExpForm({ ...newExpForm, skills: e.target.value })
        }
        className="w-full p-2 border rounded text-black"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={newExpForm.startDate}
          onChange={(e) =>
            setNewExpForm({ ...newExpForm, startDate: e.target.value })
          }
          className="w-full p-2 border rounded text-black"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date
        </label>
        <div className="space-y-2">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="untilNowExp"
              className="mr-2 text-black"
              checked={newExpForm.presentDate === "Present"}
              onChange={(e) => {
                if (e.target.checked) {
                  setNewExpForm({ 
                    ...newExpForm, 
                    presentDate: "Present",
                    endDate: null
                  });
                } else {
                  setNewExpForm({ 
                    ...newExpForm, 
                    presentDate: null,
                    endDate: ""
                  });
                }
              }}
            />
            <label htmlFor="untilNowExp">Currently working here</label>
          </div>

          {!newExpForm.presentDate && (
            <input
              type="date"
              value={newExpForm.endDate || ""}
              onChange={(e) =>
                setNewExpForm({ 
                  ...newExpForm, 
                  endDate: e.target.value,
                  presentDate: null
                })
              }
              className="w-full p-2 border rounded text-black"
              required={!newExpForm.presentDate}
            />
          )}
        </div>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Responsibilities
      </label>
      <textarea
        placeholder="Responsibilities"
        value={newExpForm.responsibilities}
        onChange={(e) =>
          setNewExpForm({
            ...newExpForm,
            responsibilities: e.target.value,
          })
        }
        className="w-full p-2 border rounded text-black"
        rows={4}
        required
      />
    </div>

    <div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end space-x-4">
      <button
        type="button"
        onClick={() => setOpenAddExperienceModal(false)}
        className="px-4 py-2 border rounded text-black"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  </form>
</Modal>

      {/* Modal Edit Experience */}
      <Modal
  isOpen={openEditExperienceModal}
  onClose={() => setOpenEditExperienceModal(false)}
>
  <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
    <h2 className="text-xl font-bold text-black">Edit Experience</h2>
  </div>

  <form onSubmit={handleExperienceUpdate} className="space-y-6">
    {expForms.map((exp, index) => (
      <div
        key={exp.id}
        className="p-4 border rounded-lg space-y-4 bg-gray-50"
      >
        <h3 className="font-semibold border-b pb-2 text-black">
          Experience #{index + 1}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              placeholder="Company Name"
              value={exp.companyName}
              onChange={(e) => {
                const newExpForms = [...expForms];
                newExpForms[index].companyName = e.target.value;
                setExpForms(newExpForms);
              }}
              className="w-full p-2 border rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              placeholder="Role"
              value={exp.role}
              onChange={(e) => {
                const newExpForms = [...expForms];
                newExpForms[index].role = e.target.value;
                setExpForms(newExpForms);
              }}
              className="w-full p-2 border rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <input
              type="text"
              placeholder="Skills"
              value={exp.skills}
              onChange={(e) => {
                const newExpForms = [...expForms];
                newExpForms[index].skills = e.target.value;
                setExpForms(newExpForms);
              }}
              className="w-full p-2 border rounded text-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={exp.startDate.split("T")[0]}
                onChange={(e) => {
                  const newExpForms = [...expForms];
                  newExpForms[index].startDate = e.target.value;
                  setExpForms(newExpForms);
                }}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="space-y-2">
                <div className="flex items-center mb-2 text-black">
                  <input
                    type="checkbox"
                    id={`untilNowExpEdit-${index}`}
                    className="mr-2"
                    checked={exp.presentDate === "Present"}
                    onChange={(e) => {
                      const newExpForms = [...expForms];
                      if (e.target.checked) {
                        newExpForms[index].presentDate = "Present";
                        newExpForms[index].endDate = null;
                      } else {
                        newExpForms[index].presentDate = null;
                        newExpForms[index].endDate = "";
                      }
                      setExpForms(newExpForms);
                    }}
                  />
                  <label htmlFor={`untilNowExpEdit-${index}`}>Present</label>
                </div>

                {!exp.presentDate && (
                  <input
                    type="date"
                    value={exp.endDate || ""}
                    onChange={(e) => {
                      const newExpForms = [...expForms];
                      newExpForms[index].endDate = e.target.value;
                      newExpForms[index].presentDate = null;
                      setExpForms(newExpForms);
                    }}
                    className="w-full p-2 border rounded text-black"
                    required={!exp.presentDate}
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsibilities
            </label>
            <textarea
              placeholder="Responsibilities"
              value={exp.responsibilities}
              onChange={(e) => {
                const newExpForms = [...expForms];
                newExpForms[index].responsibilities = e.target.value;
                setExpForms(newExpForms);
              }}
              className="w-full p-2 border rounded text-black"
              rows={4}
              required
            />
          </div>
        </div>
      </div>
    ))}

    <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t flex justify-end space-x-4 text-black">
      <button
        type="button"
        onClick={() => setOpenEditExperienceModal(false)}
        className="px-4 py-2 border rounded text-black"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save All Changes
      </button>
    </div>
  </form>
</Modal>

      {/* Modal Add Skill */}
      <Modal
        isOpen={openAddSkillModal}
        onClose={() => setOpenAddSkillModal(false)}
      >
        <h2 className="text-xl font-bold mb-4 text-black">Add Skill</h2>
        <form onSubmit={handleAddSkill} className="space-y-4">
          <input
            type="text"
            placeholder="Enter skill name"
            value={newSkillForm.skillName}
            onChange={(e) => setNewSkillForm({ skillName: e.target.value })}
            className="w-full p-2 border rounded text-black"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenAddSkillModal(false)}
              className="px-4 py-2 border rounded text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Skill */}
      <Modal
        isOpen={openEditSkillModal}
        onClose={() => setOpenEditSkillModal(false)}
      >
        <h2 className="text-xl font-bold mb-4">Edit Skill</h2>
        <form onSubmit={handleEditSkill} className="space-y-4">
          <input
            type="text"
            placeholder="Enter skill name"
            value={selectedSkill?.skillName || ""}
            onChange={(e) =>
              setSelectedSkill((prev) =>
                prev ? { ...prev, skillName: e.target.value } : null
              )
            }
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenEditSkillModal(false)}
              className="px-4 py-2 border rounded text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add CV */}
<Modal
  isOpen={openAddCVModal}
  onClose={() => {
    setOpenAddCVModal(false);
    setNewCVForm({ fileName: "" });
    setCVFile(null);
  }}
>
  <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
    <h2 className="text-xl font-bold">Upload CV</h2>
  </div>

  <form onSubmit={handleAddCV} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        CV Name
      </label>
      <input
        type="text"
        placeholder="Enter a name for this CV"
        value={newCVForm.fileName}
        onChange={(e) =>
          setNewCVForm({ ...newCVForm, fileName: e.target.value })
        }
        className="w-full p-2 border rounded text-black"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload CV (PDF only)
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".pdf"
          onChange={handleCVFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        
        {!cvFile ? (
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="text-blue-500 h-6 w-6" />
            </div>
            <p className="text-sm text-gray-500">
              Drag and drop or click to upload
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Select File
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="text-blue-500 h-5 w-5" />
              <span className="text-sm font-medium">{cvFile.name}</span>
            </div>
            <p className="text-xs text-gray-500">
              {(cvFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={() => {
                setCVFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>

    <div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end space-x-4">
      <button
        type="button"
        onClick={() => {
          setOpenAddCVModal(false);
          setNewCVForm({ fileName: "" });
          setCVFile(null);
        }}
        className="px-4 py-2 border rounded text-black"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isUploadingCV || !cvFile || !newCVForm.fileName}
        className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${
          isUploadingCV || !cvFile || !newCVForm.fileName ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
      >
        {isUploadingCV && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
        {isUploadingCV ? 'Uploading...' : 'Upload CV'}
      </button>
    </div>
  </form>
</Modal>

{/* Modal View CV */}
<Modal
  isOpen={openViewCVModal}
  onClose={() => {
    setOpenViewCVModal(false);
    setSelectedCV(null);
    setParsedCVContent("");
  }}
>
  <div className="sticky top-0 bg-white pb-4 mb-4 border-b flex justify-between items-center">
    <h2 className="text-xl font-bold">{selectedCV?.fileName || "CV Content"}</h2>
    <button
      onClick={() => {
        setOpenViewCVModal(false);
        setSelectedCV(null);
        setParsedCVContent("");
      }}
      className="text-gray-500 hover:text-gray-700"
    >
      ×
    </button>
  </div>
  
  {selectedCV ? (
    selectedCV.content ? (
      <div className="bg-white p-4 rounded-md border overflow-auto max-h-[600px]">
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: parsedCVContent }}
        />
      </div>
    ) : (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2">Loading CV content...</span>
      </div>
    )
  ) : (
    <p>No content available</p>
  )}
  
  <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t flex justify-end">
    <button
      onClick={() => {
        setOpenViewCVModal(false);
        setSelectedCV(null);
        setParsedCVContent("");
      }}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Close
    </button>
  </div>
</Modal>

{/* Add the Edit CV Modal */}
<Modal
  isOpen={openEditCVModal}
  onClose={() => {
    setOpenEditCVModal(false);
    setEditingCV(null);
    setEditCVForm({ fileName: "", content: "" });
  }}
>
  <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
    <h2 className="text-xl font-bold">Edit CV</h2>
  </div>

  <form onSubmit={handleSaveEditedCV} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        CV Name
      </label>
      <input
        type="text"
        value={editCVForm.fileName}
        onChange={(e) => setEditCVForm({ ...editCVForm, fileName: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        CV Content
      </label>
      <textarea
        value={editCVForm.content}
        onChange={(e) => setEditCVForm({ ...editCVForm, content: e.target.value })}
        className="w-full p-2 border rounded font-mono"
        rows={20}
        required
      />
    </div>

    <div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end space-x-4">
      <button
        type="button"
        onClick={() => {
          setOpenEditCVModal(false);
          setEditingCV(null);
          setEditCVForm({ fileName: "", content: "" });
        }}
        className="px-4 py-2 border rounded text-black"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSavingCV}
        className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${
          isSavingCV ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
      >
        {isSavingCV && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
        {isSavingCV ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </form>
</Modal>

    </div>
  );
}
