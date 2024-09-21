import Footer from "./components/footer";
import UploadCsv from "./components/landing/upload";
import "./globals.css";


export default function Home() {
  return (
    <div>
      <UploadCsv></UploadCsv>
      <Footer />
    </div>
  );
}
