
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Users, ClipboardList, School } from 'lucide-react';
import { Button } from "@/components/ui/button";
import useAuth from '@/context/auth/useAuth';
import ContactFormModal from '@/components/contact/ContactFormModal';
import IntervalPlanCard from '@/features/plans/components/IntervalPlanCard';
import FixedPlanCard from '@/features/plans/components/FixedPlanCard';
import SimplePlanCard from '@/features/plans/components/SimplePlanCard';
import { pricingData } from '@/features/plans/utils/pricing-utils';
import AuthModal from '@/components/auth/AuthModal';

const Plans = () => {
  const { planType, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Helper to check if the plan is the user's current plan
  const isCurrentPlan = (planName: string) => {
    if (planName === 'individual' && planType === 'individual') return true;
    if (planName === 'family' && planType === 'family') return true;
    if (planName === 'teacher' && planType === 'teacher') return true;
    if (planName === 'school' && planType === 'school') return true;
    return false;
  };

  // Handle free plan button click
  const handleFreePlanClick = () => {
    if (isLoggedIn) {
      navigate('/account');
    } else {
      // Auth modal will be shown via the component
    }
  };

  // Features for each plan
  const individualFeatures = [
    { icon: 'saved', text: 'Unlimited saved games' },
    { icon: 'user', text: `${pricingData.individual.maxUsers} User` },
    { icon: 'goals', text: 'Goal tracking' },
    { icon: 'progress', text: 'Progress reports' },
    { icon: 'typing', text: 'Typing adjusted scores' },
  ];

  const familyFeatures = [
    { icon: 'saved', text: 'Unlimited saved games' },
    { icon: 'users', text: `Up to ${pricingData.family.maxUsers} Users` },
    { icon: 'goals', text: 'Goal tracking' },
    { icon: 'progress', text: 'Progress reports' },
    { icon: 'typing', text: 'Typing adjusted scores' },
  ];

  const teacherFeatures = [
    { icon: 'saved', text: 'Unlimited saved games' },
    { icon: 'users', text: `Up to ${pricingData.teacher.maxUsers} Students` },
    { icon: 'goals', text: 'Goal tracking' },
    { icon: 'progress', text: 'Progress reports' },
    { icon: 'typing', text: 'Typing adjusted scores' },
    { icon: 'reports', text: 'Class reporting' },
    { icon: 'clipboard', text: 'Roster management' },
  ];

  const schoolFeatures = [
    { icon: 'saved', text: 'Unlimited saved games' },
    { icon: 'users', text: `Up to ${pricingData.school.maxUsers} Students` },
    { icon: 'goals', text: 'Goal tracking' },
    { icon: 'progress', text: 'Progress reports' },
    { icon: 'typing', text: 'Typing adjusted scores' },
    { icon: 'reports', text: 'Class reporting' },
    { icon: 'clipboard', text: 'Roster management' },
    { icon: 'clever', text: 'Clever integration' },
  ];

  const freeFeatures = [
    { icon: 'check', text: '5 saved games' },
    { icon: 'check', text: 'Leaderboard access' },
    { icon: 'check', text: 'Basic progress tracking' },
  ];

  const districtFeatures = [
    { icon: 'check', text: 'Prioritized Support' },
    { icon: 'check', text: 'Enterprise billing options' },
    { icon: 'check', text: 'Multi-year contracts' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="sm" onClick={() => window.history.back()} className="h-8 rounded-full">
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Unlock advanced features and enhance your learning experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Individual Plan */}
        <IntervalPlanCard
          title="Individual"
          description="Perfect for one learner"
          icon={User}
          isCurrentPlan={isCurrentPlan('individual')}
          planType="individual"
          pricing={pricingData.individual}
          features={individualFeatures}
        />

        {/* Family Plan */}
        <IntervalPlanCard
          title="Family"
          description="Great for families"
          icon={Users}
          isCurrentPlan={isCurrentPlan('family')}
          planType="family"
          pricing={pricingData.family}
          features={familyFeatures}
        />

        {/* Teacher Plan */}
        <FixedPlanCard
          title="Teacher"
          description="Ideal for classrooms"
          icon={ClipboardList}
          isCurrentPlan={isCurrentPlan('teacher')}
          planType="teacher"
          pricing={pricingData.teacher}
          features={teacherFeatures}
        />

        {/* School Plan */}
        <FixedPlanCard
          title="School"
          description="For entire schools"
          icon={School}
          isCurrentPlan={isCurrentPlan('school')}
          planType="school"
          pricing={pricingData.school}
          features={schoolFeatures}
        />
      </div>

      {/* Free and District Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {/* Free Tier */}
        <SimplePlanCard
          title="Free"
          description="Up to 5 saved games with basic reporting:"
          features={freeFeatures}
          footerContent={
            isLoggedIn ? (
              <Link to="/account" className="w-full">
                <Button variant="outline" className="w-full">Access Your Account</Button>
              </Link>
            ) : (
              <AuthModal defaultView="register">
                <Button variant="outline" className="w-full">Get Started for Free</Button>
              </AuthModal>
            )
          }
        />

        {/* District Tier */}
        <SimplePlanCard
          title="District"
          description="Everything in school plus more:"
          features={districtFeatures}
          footerContent={<ContactFormModal />}
        />
      </div>
    </div>
  );
};

export default Plans;
