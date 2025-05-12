
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, User, Users, Goal, LineChart, Keyboard, ClipboardList, CircleDollarSign, CircleCheck, School } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckoutButton } from "@/components/subscription/CheckoutButton";
import useAuth from '@/context/auth/useAuth';

const Plans = () => {
  const { planType } = useAuth();
  
  // State for pricing options in Individual and Family plans
  const [individualInterval, setIndividualInterval] = useState<'annual' | 'monthly' | 'one_time'>('annual');
  const [familyInterval, setFamilyInterval] = useState<'annual' | 'monthly' | 'one_time'>('annual');
  
  // Pricing data
  const pricingData = {
    individual: {
      monthly: 4.99,
      annual: 49.99,
      one_time: 149.99,
      maxUsers: 1,
    },
    family: {
      monthly: 7.99,
      annual: 79.99,
      one_time: 199.99,
      maxUsers: 5,
    },
    teacher: {
      price: 99.99,
      billing: 'per year',
      maxUsers: 30,
    },
    school: {
      price: 499.99,
      billing: 'per year',
      maxUsers: 200,
    }
  };

  // Helper to check if the plan is the user's current plan
  const isCurrentPlan = (planName: string) => {
    if (planName === 'individual' && planType === 'premium') return true;
    if (planName === 'family' && planType === 'family') return true;
    if (planName === 'teacher' && planType === 'teacher') return true;
    if (planName === 'school' && planType === 'school') return true;
    return false;
  };

  // Get price display based on interval
  const getPriceDisplay = (plan: 'individual' | 'family', interval: 'monthly' | 'annual' | 'one_time') => {
    const price = pricingData[plan][interval];
    if (interval === 'monthly') {
      return `$${price}/mo`;
    } else if (interval === 'annual') {
      return `$${price}/yr`;
    } else {
      return `$${price}`;
    }
  };

  // Feature icons mapping
  const FeatureIcon = ({ name }: { name: string }) => {
    switch (name) {
      case 'users':
        return <Users className="h-5 w-5 text-primary" />;
      case 'user':
        return <User className="h-5 w-5 text-primary" />;
      case 'goals':
        return <Goal className="h-5 w-5 text-primary" />;
      case 'progress':
        return <LineChart className="h-5 w-5 text-primary" />;
      case 'typing':
        return <Keyboard className="h-5 w-5 text-primary" />;
      case 'reports':
        return <LineChart className="h-5 w-5 text-primary" />;
      case 'roster':
        return <ClipboardList className="h-5 w-5 text-primary" />;
      case 'saved':
        return <CircleCheck className="h-5 w-5 text-primary" />;
      case 'clever':
        return <CircleDollarSign className="h-5 w-5 text-primary" />;
      default:
        return <Check className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center gap-4 mb-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.history.back()}
          className="h-8 rounded-full"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Select the perfect plan for your needs. Unlock advanced features and enhance your learning experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Individual Plan */}
        <Card className={`relative flex flex-col ${isCurrentPlan('individual') ? 'border-primary border-2' : ''}`}>
          {isCurrentPlan('individual') && (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Your Plan</Badge>
          )}
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 rounded-full p-3 mb-2">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Individual</h2>
            <p className="text-sm text-muted-foreground">Perfect for personal learning</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold">{getPriceDisplay('individual', individualInterval)}</p>
              <Select 
                value={individualInterval} 
                onValueChange={(value: string) => setIndividualInterval(value as 'monthly' | 'annual' | 'one_time')}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select billing period" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="one_time">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <CheckoutButton 
              planType="premium"
              interval={individualInterval}
              label="Get Started"
              className="w-full mb-6"
            />
            
            <ul className="space-y-2">
              <li className="flex items-center">
                <FeatureIcon name="saved" />
                <span className="ml-2">Unlimited Saved Games</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="user" />
                <span className="ml-2">{pricingData.individual.maxUsers} User</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="goals" />
                <span className="ml-2">Goal Tracking</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="progress" />
                <span className="ml-2">Progress Reports</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="typing" />
                <span className="ml-2">Typing Speed Diagnostics</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {/* Footer content (if needed) */}
          </CardFooter>
        </Card>

        {/* Family Plan */}
        <Card className={`relative flex flex-col ${isCurrentPlan('family') ? 'border-primary border-2' : ''}`}>
          {isCurrentPlan('family') && (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Your Plan</Badge>
          )}
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 rounded-full p-3 mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Family</h2>
            <p className="text-sm text-muted-foreground">Great for families</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold">{getPriceDisplay('family', familyInterval)}</p>
              <Select 
                value={familyInterval} 
                onValueChange={(value: string) => setFamilyInterval(value as 'monthly' | 'annual' | 'one_time')}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select billing period" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="one_time">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <CheckoutButton 
              planType="family"
              interval={familyInterval}
              label="Get Started"
              className="w-full mb-6"
            />
            
            <ul className="space-y-2">
              <li className="flex items-center">
                <FeatureIcon name="saved" />
                <span className="ml-2">Unlimited Saved Games</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="users" />
                <span className="ml-2">Up to {pricingData.family.maxUsers} Users</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="goals" />
                <span className="ml-2">Goal Tracking</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="progress" />
                <span className="ml-2">Progress Reports</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="typing" />
                <span className="ml-2">Typing Speed Diagnostics</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {/* Footer content (if needed) */}
          </CardFooter>
        </Card>

        {/* Teacher Plan */}
        <Card className={`relative flex flex-col ${isCurrentPlan('teacher') ? 'border-primary border-2' : ''}`}>
          {isCurrentPlan('teacher') && (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Your Plan</Badge>
          )}
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 rounded-full p-3 mb-2">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Teacher</h2>
            <p className="text-sm text-muted-foreground">Ideal for classrooms</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold">${pricingData.teacher.price}</p>
              <p className="text-sm text-muted-foreground">{pricingData.teacher.billing}</p>
            </div>
            
            <CheckoutButton 
              planType="teacher"
              interval="annual"
              label="Get Started"
              className="w-full mb-6"
            />
            
            <ul className="space-y-2">
              <li className="flex items-center">
                <FeatureIcon name="saved" />
                <span className="ml-2">Unlimited Saved Games</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="users" />
                <span className="ml-2">Up to {pricingData.teacher.maxUsers} Students</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="goals" />
                <span className="ml-2">Goal Tracking</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="progress" />
                <span className="ml-2">Progress Reports</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="typing" />
                <span className="ml-2">Typing Speed Diagnostics</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="reports" />
                <span className="ml-2">Class Reporting</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="roster" />
                <span className="ml-2">Roster Management</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {/* Footer content (if needed) */}
          </CardFooter>
        </Card>

        {/* School Plan */}
        <Card className={`relative flex flex-col ${isCurrentPlan('school') ? 'border-primary border-2' : ''}`}>
          {isCurrentPlan('school') && (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Your Plan</Badge>
          )}
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 rounded-full p-3 mb-2">
              <School className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">School</h2>
            <p className="text-sm text-muted-foreground">For entire schools</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold">${pricingData.school.price}</p>
              <p className="text-sm text-muted-foreground">{pricingData.school.billing}</p>
            </div>
            
            <CheckoutButton 
              planType="school"
              interval="annual"
              label="Get Started"
              className="w-full mb-6"
            />
            
            <ul className="space-y-2">
              <li className="flex items-center">
                <FeatureIcon name="saved" />
                <span className="ml-2">Unlimited Saved Games</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="users" />
                <span className="ml-2">Up to {pricingData.school.maxUsers} Students</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="goals" />
                <span className="ml-2">Goal Tracking</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="progress" />
                <span className="ml-2">Progress Reports</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="clever" />
                <span className="ml-2">Clever Integration</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="typing" />
                <span className="ml-2">Typing Speed Diagnostics</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="reports" />
                <span className="ml-2">Class Reporting</span>
              </li>
              <li className="flex items-center">
                <FeatureIcon name="roster" />
                <span className="ml-2">Roster Management</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {/* Footer content (if needed) */}
          </CardFooter>
        </Card>
      </div>

      {/* Free and District Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {/* Free Tier */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Free</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Up to 5 Saved Games with leaderboard and progress tracking</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>5 Saved Games</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Leaderboard Access</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Basic Progress Tracking</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full">Get Started for Free</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* District Tier */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">District</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Everything in school plus support, enterprise billing, multi-year, and more.</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>All School Plan Features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Dedicated Support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Enterprise Billing Options</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Multi-Year Contracts</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Contact Us for Pricing</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Plans;
