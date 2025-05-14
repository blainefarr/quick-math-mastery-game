
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Check, Users, Award, BarChart } from 'lucide-react';
const HomeSeoContent = () => {
  return <div className="w-full bg-background py-16">
      {/* Hook / Intro Section - Now with a distinct background */}
      <section className="container mx-auto px-4 mb-16 py-12 bg-primary/5 rounded-xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          The ultimate app for mastering mental math—fast.
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto">
          Minute Math is a free mental math game designed to build speed, accuracy, and confidence in math facts. 
          With timed challenges, instant feedback, and a kid-friendly interface, this app makes mental math practice 
          fun and effective—for school or home.
        </p>
      </section>

      {/* Why Our Mental Math App Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Why Our Mental Math App Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Focused repetition</h3>
              </div>
              <p className="text-muted-foreground">
                Builds fluency. Timed games turn math fact drills into brain-boosting fun.
              </p>
            </Card>
            
            <Card className="p-6 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Master core skills</h3>
              </div>
              <p className="text-muted-foreground">
                Practice mental math in addition, subtraction, multiplication, and division.
              </p>
            </Card>
            
            <Card className="p-6 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Speed + accuracy</h3>
              </div>
              <p className="text-muted-foreground">
                Watch students sharpen their math minds with each round as they build mastery.
              </p>
            </Card>
            
            <Card className="p-6 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <BarChart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Distraction-free</h3>
              </div>
              <p className="text-muted-foreground">
                This minimal, fast-paced app helps kids focus purely on mental math.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Who It's For</h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg mb-6">Minute Math is built for:</p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-3 mt-1">
                <Check className="h-3 w-3 text-accent-foreground" />
              </div>
              <span>Students who want to get faster at math facts</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-3 mt-1">
                <Check className="h-3 w-3 text-accent-foreground" />
              </div>
              <span>Parents looking for an easy and effective way to improve mental math at home</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-3 mt-1">
                <Check className="h-3 w-3 text-accent-foreground" />
              </div>
              <span>Teachers who need warm-ups, timed challenges, or math center games</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-3 mt-1">
                <Check className="h-3 w-3 text-accent-foreground" />
              </div>
              <span>Homeschoolers looking for a no-prep math drill solution</span>
            </li>
          </ul>
          
          <p className="text-lg text-center font-medium">
            This mental math app is ideal for grades 1–6 and perfect for classroom or independent use.
          </p>
        </div>
      </section>

      {/* Get More with Pro & Teacher Plans */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Get More with Pro & Teacher Plans</h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-6 text-center">
              Unlock advanced tools to take your students' mental math to the next level:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Unlimited score tracking</h3>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Typing speed adjustment and math speed analytics</h3>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Full access to all operations and challenge levels</h3>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Teacher dashboard to manage classrooms</h3>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Custom leaderboards for friendly competition</h3>
                </div>
              </div>
            </div>
            
            <p className="text-center mb-8">
              Built-in mental math analytics help teachers and parents spot progress and patterns instantly.
            </p>
            
            <div className="flex justify-center">
              <Link to="/plans">
                <Button size="lg" className="px-8">
                  See Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What Educators and Families Say */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">What Educators and Families Say</h2>
        
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <div className="bg-card p-8 rounded-lg shadow-sm relative">
            <div className="text-4xl font-serif text-primary/20 absolute top-4 left-4">"</div>
            <p className="text-lg mb-6 relative z-10 pt-6">
              Minute Math is the best mental math game I've found. My students are quicker, and they actually look forward to playing!
            </p>
            <p className="font-medium">— 4th Grade Teacher, Texas</p>
          </div>
          
          <div className="bg-card p-8 rounded-lg shadow-sm relative">
            <div className="text-4xl font-serif text-primary/20 absolute top-4 left-4">"</div>
            <p className="text-lg mb-6 relative z-10 pt-6">
              My daughter plays a round before school every day. She's gotten way faster—and loves the challenge.
            </p>
            <p className="font-medium">— Parent of 2nd Grader</p>
          </div>
        </div>
      </section>

      {/* Mental Math FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Mental Math FAQ</h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-2">What is a mental math game?</h3>
              <p>
                A mental math game is a timed challenge that helps students solve math problems in their head—without writing or calculators. 
                Minute Math is a free online mental math app that does exactly that.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">Is Minute Math really free?</h3>
              <p>
                Yes! You can play and save up to 10 scores on the free plan. Upgrades are available for more features.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">What age is Minute Math best for?</h3>
              <p>
                The app is ideal for kids in 1st–6th grade, or anyone practicing core math facts.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">How does this app build mental math skills?</h3>
              <p>
                Through repetition, speed, and immediate feedback, Minute Math improves mental math fluency in just a few minutes a day.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">Can I use it in the classroom?</h3>
              <p>
                Absolutely. Teachers use it for bell ringers, centers, and math fluency assessments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mental Math Matters */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Mental Math Matters</h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-xl font-medium text-center mb-6">
            Mental math isn't just a skill—it's a superpower.
          </p>
          
          <p className="mb-6">
            Research shows that students who build fluency in basic math facts are better prepared for higher-level 
            problem solving. Practicing mental math daily improves:
          </p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-3 mt-1">
                <Check className="h-3 w-3 text-accent-foreground" />
              </div>
              <span>Processing speed</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-3 mt-1">
                <Check className="h-3 w-3 text-accent-foreground" />
              </div>
              <span>Math confidence</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-3 mt-1">
                <Check className="h-3 w-3 text-accent-foreground" />
              </div>
              <span>Test scores</span>
            </li>
          </ul>
          
          <p className="text-center">
            That's why mental math games like Minute Math are trusted by teachers, parents, and homeschoolers to build 
            foundational math strength in a fun, repeatable way.
          </p>
        </div>
      </section>
    </div>;
};
export default HomeSeoContent;
