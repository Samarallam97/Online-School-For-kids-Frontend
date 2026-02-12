import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface ShareProfileDialogProps {
  userId: string;
  userName: string;
  trigger?: React.ReactNode;
}

export function ShareProfileDialog({ userId, userName, trigger }: ShareProfileDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrCode, setShowQrCode] = useState(false);

  const profileUrl = `${window.location.origin}/profile/${userId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQrCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrDataUrl);
      setShowQrCode(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQrCode = () => {
    const link = document.createElement('a');
    link.download = `${userName}-profile-qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `Check out ${userName}'s profile on EduPlatform!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = `Check out ${userName}'s profile`;
    const body = `I thought you might be interested in ${userName}'s profile on EduPlatform:\n\n${profileUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaWhatsApp = () => {
    const text = `Check out ${userName}'s profile on EduPlatform: ${profileUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Profile</DialogTitle>
          <DialogDescription>
            Share {userName}'s profile with others
          </DialogDescription>
        </DialogHeader>

        {!showQrCode ? (
          <div className="space-y-4">
            {/* Copy Link Section */}
            <div className="space-y-2">
              <Label htmlFor="profile-link">Profile Link</Label>
              <div className="flex gap-2">
                <Input
                  id="profile-link"
                  value={profileUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Social Media Sharing */}
            <div className="space-y-2">
              <Label>Share on Social Media</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={shareToFacebook}
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={shareToTwitter}
                >
                  <Twitter className="h-5 w-5 text-sky-500" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={shareToLinkedIn}
                >
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              </div>
            </div>

            {/* Other Sharing Options */}
            <div className="space-y-2">
              <Label>Share via</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={shareViaEmail}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={shareViaWhatsApp}
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* QR Code Option */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleGenerateQrCode}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <img
                src={qrCodeUrl}
                alt="Profile QR Code"
                className="border rounded-lg p-4 bg-white"
              />
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code to visit the profile
              </p>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowQrCode(false)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleDownloadQrCode}
                >
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}