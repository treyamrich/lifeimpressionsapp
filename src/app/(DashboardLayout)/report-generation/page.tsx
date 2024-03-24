"use client";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import PageContainer from "../components/container/PageContainer";
import GenerateReportForm from "./GenerateReportForm";

const ReportGeneration = () => {
  return (
    <PageContainer
      title="Report Generation"
      description={`this is the report generation page`}
    >
      <DashboardCard title="Generate Report">
        <GenerateReportForm />
      </DashboardCard>
    </PageContainer>
  );
};

export default ReportGeneration;
