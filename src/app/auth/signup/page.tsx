"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Truck, User, Mail, Phone, MapPin, Shield, Upload, Camera, FileImage, X } from "lucide-react";
import { toast } from "sonner";

export default function CourierSignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    vehicleType: "",
    licenseNumber: "",
    address: "",
  });
  const [idCardImage, setIdCardImage] = useState<File | null>(null);
  const [driverLicenseImage, setDriverLicenseImage] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [driverLicensePreview, setDriverLicensePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Courier qeydiyyat API-si
      const response = await fetch("/api/auth/courier/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Courier account created successfully!");
        router.push("/auth/signin");
      } else {
        const error = await response.json();
        toast.error(error.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("ID card image must be less than 5MB");
        return;
      }
      setIdCardImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIdCardPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDriverLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Driver license image must be less than 5MB");
        return;
      }
      setDriverLicenseImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setDriverLicensePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIdCardImage = () => {
    setIdCardImage(null);
    setIdCardPreview(null);
  };

  const removeDriverLicenseImage = () => {
    setDriverLicenseImage(null);
    setDriverLicensePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-white border-gray-200 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Join as Courier / Kuryer Ol
            </CardTitle>
            <p className="text-gray-600">
              Start earning with Yusu Courier. Flexible hours, competitive rates.
              / Yusu Courier ilə qazanmağa başlayın. Çevik saatlar, rəqabətli tariflər.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 mb-2 block font-medium">
                    Full Name / Tam Ad
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 mb-2 block font-medium">
                    Email Address / Email Ünvanı
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 mb-2 block font-medium">
                    Phone Number / Telefon Nömrəsi
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="+994 XX XXX XX XX"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vehicleType" className="text-gray-700 mb-2 block font-medium">
                    Vehicle Type / Nəqliyyat Növü
                  </Label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    required
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="MOTORCYCLE">Motorcycle / Motosikl</option>
                    <option value="CAR">Car / Avtomobil</option>
                    <option value="BICYCLE">Bicycle / Velosiped</option>
                    <option value="VAN">Van / Minivan</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="licenseNumber" className="text-gray-300 mb-2 block">
                    License Number / Lisenziya Nömrəsi
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Enter license number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-gray-300 mb-2 block">
                    Address / Ünvan
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-gray-700 mb-2 block font-medium">
                    Password / Şifrə
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Create a strong password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700 mb-2 block font-medium">
                    Confirm Password / Şifrəni Təsdiq Et
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {/* Document Upload Section / Sənəd Yükləmə Bölməsi */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileImage className="h-5 w-5 mr-2 text-blue-600" />
                  Required Documents / Tələb Olunan Sənədlər
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Card Upload */}
                  <div>
                    <Label className="text-gray-700 mb-2 block font-medium">
                      ID Card / Şəxsiyyət Vəsiqəsi
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      {idCardPreview ? (
                        <div className="relative">
                          <img
                            src={idCardPreview}
                            alt="ID Card Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeIdCardImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-2">
                            Upload ID Card Image
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIdCardUpload}
                            className="hidden"
                            id="idCard"
                          />
                          <label
                            htmlFor="idCard"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Driver License Upload */}
                  <div>
                    <Label className="text-gray-700 mb-2 block font-medium">
                      Driver License / Sürücülük Vəsiqəsi
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      {driverLicensePreview ? (
                        <div className="relative">
                          <img
                            src={driverLicensePreview}
                            alt="Driver License Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeDriverLicenseImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-2">
                            Upload Driver License Image
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDriverLicenseUpload}
                            className="hidden"
                            id="driverLicense"
                          />
                          <label
                            htmlFor="driverLicense"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please ensure all documents are clearly visible and in good quality. 
                    Maximum file size: 5MB per image.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/auth/signin")}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Already have an account? / Hesabınız var?
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !idCardImage || !driverLicenseImage}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Create Account / Hesab Yarat"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}