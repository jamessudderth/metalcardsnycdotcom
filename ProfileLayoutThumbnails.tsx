import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LayoutThumbnailProps {
  layoutName: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const LayoutThumbnail = ({ layoutName, description, isSelected, onClick }: LayoutThumbnailProps) => {
  const getThumbnailContent = () => {
    switch (layoutName) {
      case 'Classic':
        return (
          <div className="w-full h-32 bg-gradient-to-r from-blue-50 to-white rounded-lg overflow-hidden relative">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-8 w-full"></div>
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full border border-gray-200"></div>
            <div className="pt-4 px-3 space-y-1">
              <div className="h-1.5 bg-gray-800 rounded w-16 mx-auto"></div>
              <div className="h-1 bg-blue-600 rounded w-12 mx-auto"></div>
              <div className="pt-1 space-y-0.5">
                <div className="h-0.5 bg-gray-400 rounded w-full"></div>
                <div className="h-0.5 bg-gray-400 rounded w-full"></div>
                <div className="h-0.5 bg-gray-400 rounded w-3/4"></div>
              </div>
              <div className="pt-1 space-y-0.5">
                <div className="h-2 bg-blue-100 border border-blue-200 rounded w-full"></div>
                <div className="h-2 bg-blue-100 border border-blue-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        );

      case 'Modern':
        return (
          <div className="w-full h-32 bg-gray-50 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-12 w-full relative">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-white/20 rounded-lg"></div>
            </div>
            <div className="pt-4 px-3 space-y-1">
              <div className="h-1.5 bg-gray-900 rounded w-16 mx-auto"></div>
              <div className="h-1 bg-purple-600 rounded w-12 mx-auto"></div>
              <div className="pt-1 space-y-0.5">
                <div className="h-2 bg-gray-50 border border-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-50 border border-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-50 border border-gray-200 rounded w-3/4"></div>
              </div>
              <div className="pt-1">
                <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded w-full"></div>
              </div>
            </div>
          </div>
        );

      case 'Minimal':
        return (
          <div className="w-full h-32 bg-white rounded-lg overflow-hidden flex flex-col items-center justify-center space-y-1">
            <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full"></div>
            <div className="h-1.5 bg-gray-900 rounded w-16"></div>
            <div className="h-1 bg-gray-600 rounded w-12"></div>
            <div className="pt-1 space-y-0.5 w-full px-4">
              <div className="h-0.5 bg-gray-500 rounded w-full"></div>
              <div className="h-0.5 bg-gray-500 rounded w-3/4 mx-auto"></div>
              <div className="h-0.5 bg-gray-500 rounded w-2/3 mx-auto"></div>
            </div>
            <div className="pt-1 space-y-0.5 w-full px-4">
              <div className="h-1.5 bg-gray-200 border border-gray-300 rounded w-full"></div>
              <div className="h-1.5 bg-gray-200 border border-gray-300 rounded w-full"></div>
            </div>
          </div>
        );

      case 'Creative':
        return (
          <div className="w-full h-32 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-lg overflow-hidden relative">
            <div className="absolute inset-2 bg-white/95 rounded-xl p-2 flex flex-col items-center space-y-1">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl"></div>
              <div className="h-1.5 bg-gradient-to-r from-orange-600 to-pink-600 rounded w-16"></div>
              <div className="h-1 bg-gray-700 rounded w-10"></div>
              <div className="pt-0.5 space-y-0.5 w-full">
                <div className="h-1.5 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded w-full"></div>
                <div className="h-1.5 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded w-full"></div>
                <div className="h-1.5 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded w-3/4"></div>
              </div>
              <div className="pt-0.5 w-full">
                <div className="h-1.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded w-full"></div>
              </div>
            </div>
          </div>
        );

      case 'Corporate':
        return (
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <div className="bg-gray-900 h-10 w-full p-1 flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-0.5">
                <div className="h-1 bg-white rounded w-12"></div>
                <div className="h-0.5 bg-gray-300 rounded w-8"></div>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <div className="h-1 bg-gray-900 rounded w-20"></div>
              <div className="grid grid-cols-2 gap-1 pt-1">
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-gray-600 rounded w-full"></div>
                  <div className="h-0.5 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-0.5 bg-gray-600 rounded w-full"></div>
                </div>
                <div className="space-y-0.5">
                  <div className="h-1.5 bg-gray-200 border border-gray-300 rounded w-full"></div>
                  <div className="h-1.5 bg-gray-200 border border-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">Preview</span>
          </div>
        );
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {getThumbnailContent()}
        <div className="mt-3 text-center">
          <h3 className="font-semibold text-sm text-gray-900">{layoutName}</h3>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
          {isSelected && (
            <Badge variant="default" className="mt-2 text-xs">
              Selected
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ProfileLayoutThumbnailsProps {
  selectedLayout?: string;
  onLayoutSelect?: (layout: string) => void;
}

const ProfileLayoutThumbnails = ({ selectedLayout, onLayoutSelect }: ProfileLayoutThumbnailsProps) => {
  const layouts = [
    {
      name: 'Classic',
      key: 'classic',
      description: 'Traditional business card style with blue gradient header'
    },
    {
      name: 'Modern',
      key: 'modern',
      description: 'Clean contemporary design with purple-pink gradients'
    },
    {
      name: 'Minimal',
      key: 'minimal',
      description: 'Simple and clean layout focused on content'
    },
    {
      name: 'Creative',
      key: 'creative',
      description: 'Bold and artistic with vibrant orange-pink colors'
    },
    {
      name: 'Corporate',
      key: 'corporate',
      description: 'Professional formal layout with dark header'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {layouts.map((layout) => (
        <LayoutThumbnail
          key={layout.key}
          layoutName={layout.name}
          description={layout.description}
          isSelected={selectedLayout === layout.key}
          onClick={() => onLayoutSelect?.(layout.key)}
        />
      ))}
    </div>
  );
};

export default ProfileLayoutThumbnails;