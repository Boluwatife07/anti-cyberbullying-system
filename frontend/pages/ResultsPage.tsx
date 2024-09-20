import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const ResultsPage = () => {
  const [csvUrl, setCsvUrl] = useState<string | null>(null);
  const [cyberbullyingCount, setCyberbullyingCount] = useState<number>(0);
  const [nonCyberbullyingCount, setNonCyberbullyingCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const { query } = router;
    if (query.fileUrl) {
      setCsvUrl(query.fileUrl as string);
      fetchCsvData(query.fileUrl as string);
    }
  }, [router]);

  // Fetch the CSV data and calculate cyberbullying percentages
  const fetchCsvData = async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl);
      const csvText = await response.text();
      const rows = csvText.split("\n").slice(1); // Skip header row

      let cyberbullying = 0;
      let nonCyberbullying = 0;

      rows.forEach((row) => {
        const columns = row.split(",");
        const label = columns[1]?.trim(); // Assumes the label is in the second column

        if (label === "1") {
          cyberbullying += 1;
        } else if (label === "0") {
          nonCyberbullying += 1;
        }
      });

      setCyberbullyingCount(cyberbullying);
      setNonCyberbullyingCount(nonCyberbullying);
    } catch (error) {
      console.error("Error fetching CSV data:", error);
    }
  };

  const total = cyberbullyingCount + nonCyberbullyingCount;
  const cyberbullyingPercentage = total > 0 ? (cyberbullyingCount / total) * 100 : 0;
  const nonCyberbullyingPercentage = total > 0 ? (nonCyberbullyingCount / total) * 100 : 0;

  // Pie chart data
  const pieData = {
    labels: ["Cyberbullying", "Non-Cyberbullying"],
    datasets: [
      {
        data: [cyberbullyingCount, nonCyberbullyingCount],
        backgroundColor: ["#00b894", "#ffffff"],
        hoverBackgroundColor: ["#00b894", "#dfe6e9"],
      },
    ],
  };

  // Bar chart data
  const barData = {
    labels: ["Cyberbullying", "Non-Cyberbullying"],
    datasets: [
      {
        label: "Count",
        data: [cyberbullyingCount, nonCyberbullyingCount],
        backgroundColor: ["#00b894", "#ffffff"],
        hoverBackgroundColor: ["#00b894", "#dfe6e9"],
      },
    ],
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 text-black flex flex-col   p-4">
      {csvUrl ? (
        <div>
          <div className="p-4">
            <div className=" flex flex-col gap-2 justify-center text-center ">
              <h2 className="text-2xl font-bold mb-4">Cyberbullying Analysis</h2>
              <p>Total Tweets: {total}</p>
              <p>Cyberbullying: {cyberbullyingCount} ({cyberbullyingPercentage.toFixed(2)}%)</p>
              <p>Non-Cyberbullying: {nonCyberbullyingCount} ({nonCyberbullyingPercentage.toFixed(2)}%)</p>
            </div>

            <div className="mt-6 flex md:flex-row flex-col w-full justify-center gap-20">
              <div style={{ width: "360px", }}>
                <h3 className="text-xl font-bold text-center mb-2">Pie Chart</h3>
                <Pie data={pieData} />
              </div>
              <div style={{ width: "400px",  }}>
                <h3 className="text-xl font-bold text-center mb-2">Bar Chart</h3>
                <Bar data={barData} />
              </div>
            </div>
          </div>
          <p className="md:text-lg mt-7 mb-3 text-base">
  Your analysis is complete. Download the processed CSV: <br /> the analysis is labeled with 
  <span className="font-bold"> 1 </span> for cyberbullying and 
  <span className="font-bold"> 0 </span> for non-cyberbullying.
</p>
          <a
            href={csvUrl}
            download="analyzed_results.csv"
            className="bg-green-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-700 transition"
          >
            Download CSV
          </a>
        </div>
      ) : (
        <p className="">No results available.</p>
      )}
    </div>
  );
};

export default ResultsPage;
