import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import ProfileLayoutThumbnails from "@/components/ProfileLayoutThumbnails";

// Form validation schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  jobTitle: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phoneNumber: z.string().min(5, { message: "Please enter a valid phone number" }).optional(),
  address: z.string().optional(),
  profileTemplate: z.string().min(1, { message: "Please select a digital profile style" }),
});

type LinkType = {
  id?: number;
  profileId?: number;
  linkType: string;
  url: string;
  isNew?: boolean;
  isDeleted?: boolean;
};

interface ProfileFormProps {
  defaultValues?: any;
  links?: LinkType[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ProfileForm = ({ defaultValues = {}, links = [], onSubmit, isLoading }: ProfileFormProps) => {
  const [formLinks, setFormLinks] = useState<LinkType[]>(
    links.length > 0 ? links : []
  );

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: defaultValues.fullName || "",
      jobTitle: defaultValues.jobTitle || "",
      email: defaultValues.email || "",
      phoneNumber: defaultValues.phoneNumber || "",
      address: defaultValues.address || "",
      profileTemplate: defaultValues.profileTemplate || "classic",
    },
  });

  const addLink = () => {
    if (formLinks.filter(link => !link.isDeleted).length >= 3) {
      return;
    }

    setFormLinks([
      ...formLinks,
      {
        linkType: "website",
        url: "",
        isNew: true,
      },
    ]);
  };

  const removeLink = (index: number) => {
    const updatedLinks = [...formLinks];
    
    if (updatedLinks[index].id) {
      // Mark existing link as deleted
      updatedLinks[index] = { ...updatedLinks[index], isDeleted: true };
    } else {
      // Remove new link completely
      updatedLinks.splice(index, 1);
    }
    
    setFormLinks(updatedLinks);
  };

  const updateLinkType = (index: number, value: string) => {
    const updatedLinks = [...formLinks];
    updatedLinks[index] = { ...updatedLinks[index], linkType: value };
    setFormLinks(updatedLinks);
  };

  const updateLinkUrl = (index: number, value: string) => {
    const updatedLinks = [...formLinks];
    updatedLinks[index] = { ...updatedLinks[index], url: value };
    setFormLinks(updatedLinks);
  };

  const handleSubmit = (data: z.infer<typeof profileFormSchema>) => {
    // Prepare links data for submission
    const linksToSubmit = formLinks
      .filter(link => !link.isDeleted)
      .map(({ isNew, isDeleted, ...linkData }) => linkData);
    
    // Prepare links to delete
    const linksToDelete = formLinks
      .filter(link => link.isDeleted && link.id)
      .map(link => link.id);

    onSubmit({
      ...data,
      links: linksToSubmit,
      deleteLinks: linksToDelete,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Marketing Director" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="123 Business Ave, Suite 200, New York, NY 10001" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Digital Profile Template Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Digital Profile Style</h3>
          <FormField
            control={form.control}
            name="profileTemplate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Choose Your Digital Profile Layout</FormLabel>
                <FormControl>
                  <ProfileLayoutThumbnails
                    selectedLayout={field.value}
                    onLayoutSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Custom Links (Optional)</h3>
          <div className="space-y-4">
            {formLinks.map((link, index) => (
              !link.isDeleted && (
                <div key={link.id || `new-${index}`} className="flex items-start space-x-2">
                  <Select 
                    value={link.linkType} 
                    onValueChange={(value) => updateLinkType(index, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input 
                    className="flex-1"
                    value={link.url}
                    onChange={(e) => updateLinkUrl(index, e.target.value)}
                    placeholder={`https://your${link.linkType}.com`}
                  />
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeLink(index)} 
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            ))}

            {formLinks.filter(link => !link.isDeleted).length < 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLink}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
                <span className="text-gray-500 ml-2">
                  ({3 - formLinks.filter(link => !link.isDeleted).length} remaining)
                </span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
