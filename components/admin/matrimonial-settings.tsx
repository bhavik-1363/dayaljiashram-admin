"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MatrimonialSettings() {
  const [open, setOpen] = useState(false)
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60])
  const [heightRange, setHeightRange] = useState<[number, number]>([150, 190])
  const [incomeRange, setIncomeRange] = useState<[number, number]>([0, 200000])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Matrimonial Settings</DialogTitle>
          <DialogDescription>Configure filters and sorting options for matrimonial profiles.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="filters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="sorting">Sorting</TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Gender</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    Age Range: {ageRange[0]} - {ageRange[1]} years
                  </h3>
                  <Slider
                    defaultValue={ageRange}
                    min={18}
                    max={80}
                    step={1}
                    onValueChange={(value) => setAgeRange(value as [number, number])}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    Height Range: {heightRange[0]} - {heightRange[1]} cm
                  </h3>
                  <Slider
                    defaultValue={heightRange}
                    min={140}
                    max={210}
                    step={1}
                    onValueChange={(value) => setHeightRange(value as [number, number])}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    Annual Income Range: ${incomeRange[0].toLocaleString()} - ${incomeRange[1].toLocaleString()}
                  </h3>
                  <Slider
                    defaultValue={incomeRange}
                    min={0}
                    max={500000}
                    step={10000}
                    onValueChange={(value) => setIncomeRange(value as [number, number])}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Religion</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hindu" />
                      <Label htmlFor="hindu">Hindu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="muslim" />
                      <Label htmlFor="muslim">Muslim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="christian" />
                      <Label htmlFor="christian">Christian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sikh" />
                      <Label htmlFor="sikh">Sikh</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="jain" />
                      <Label htmlFor="jain">Jain</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="buddhist" />
                      <Label htmlFor="buddhist">Buddhist</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Diet Preference</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="vegetarian" />
                      <Label htmlFor="vegetarian">Vegetarian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="non-vegetarian" />
                      <Label htmlFor="non-vegetarian">Non-Vegetarian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="vegan" />
                      <Label htmlFor="vegan">Vegan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="halal" />
                      <Label htmlFor="halal">Halal</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Marital Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="never-married" />
                      <Label htmlFor="never-married">Never Married</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="divorced" />
                      <Label htmlFor="divorced">Divorced</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="widowed" />
                      <Label htmlFor="widowed">Widowed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="separated" />
                      <Label htmlFor="separated">Separated</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Mother Tongue</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hindi" />
                      <Label htmlFor="hindi">Hindi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="gujarati" />
                      <Label htmlFor="gujarati">Gujarati</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="punjabi" />
                      <Label htmlFor="punjabi">Punjabi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tamil" />
                      <Label htmlFor="tamil">Tamil</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="telugu" />
                      <Label htmlFor="telugu">Telugu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="malayalam" />
                      <Label htmlFor="malayalam">Malayalam</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Education</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Profession</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="it">IT Professional</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="engineer">Engineer</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="government">Government Job</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Verification Status</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verified" />
                      <Label htmlFor="verified">Verified Profiles Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="with-documents" />
                      <Label htmlFor="with-documents">With Documents Only</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Profile Status</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="active" defaultChecked />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="featured" defaultChecked />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="inactive" />
                      <Label htmlFor="inactive">Inactive</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Location</h3>
                  <Input placeholder="Enter location" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sorting" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sort By</h3>
                  <RadioGroup defaultValue="recent">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recent" id="recent" />
                      <Label htmlFor="recent">Recently Added</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="age-asc" id="age-asc" />
                      <Label htmlFor="age-asc">Age (Low to High)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="age-desc" id="age-desc" />
                      <Label htmlFor="age-desc">Age (High to Low)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="height-asc" id="height-asc" />
                      <Label htmlFor="height-asc">Height (Low to High)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="height-desc" id="height-desc" />
                      <Label htmlFor="height-desc">Height (High to Low)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income-asc" id="income-asc" />
                      <Label htmlFor="income-asc">Income (Low to High)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income-desc" id="income-desc" />
                      <Label htmlFor="income-desc">Income (High to Low)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="name-asc" id="name-asc" />
                      <Label htmlFor="name-asc">Name (A to Z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="name-desc" id="name-desc" />
                      <Label htmlFor="name-desc">Name (Z to A)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Display Options</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="featured-first" defaultChecked />
                      <Label htmlFor="featured-first">Show Featured Profiles First</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verified-first" defaultChecked />
                      <Label htmlFor="verified-first">Show Verified Profiles First</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="with-images-first" defaultChecked />
                      <Label htmlFor="with-images-first">Show Profiles with Images First</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Results Per Page</h3>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
