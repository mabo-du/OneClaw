import { useState } from "react";
import { motion } from "framer-motion";
import { platforms, getInstallSteps, type Platform } from "@/data/installData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CodeBlock from "@/components/CodeBlock";
import StepNavigator from "@/components/StepNavigator";
import { CheckCircle, AlertTriangle, Lightbulb, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InstallWizard() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [step, setStep] = useState(0);

  if (!platform) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Install OpenClaw</h1>
          <p className="text-muted-foreground mt-1">Choose your operating system to get started.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <motion.div key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                onClick={() => { setPlatform(p.id); setStep(0); }}
              >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{p.icon}</div>
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const steps = getInstallSteps(platform);
  const currentStep = steps[step];
  const platformInfo = platforms.find(p => p.id === platform)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setPlatform(null)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {platformInfo.icon} {platformInfo.name} Installation
          </h1>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}: {currentStep.title}
          </p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {i < step && <CheckCircle className="inline h-3 w-3 mr-1" />}
            {s.title}
          </button>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep.commands.map((cmd, i) => (
            <div key={i}>
              <CodeBlock code={cmd.code} title={cmd.label} language="bash" />
              {cmd.note && (
                <p className="text-sm text-muted-foreground ml-1 mt-1 flex items-start gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-warning" />
                  {cmd.note}
                </p>
              )}
            </div>
          ))}

          {currentStep.tips && currentStep.tips.length > 0 && (
            <div className="rounded-lg bg-info/10 border border-info/20 p-4 mt-4">
              <h4 className="text-sm font-semibold text-info flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-4 w-4" /> Tips
              </h4>
              <ul className="space-y-1">
                {currentStep.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <StepNavigator
        current={step}
        total={steps.length}
        onPrev={() => setStep(Math.max(0, step - 1))}
        onNext={() => setStep(Math.min(steps.length - 1, step + 1))}
      />
    </div>
  );
}
