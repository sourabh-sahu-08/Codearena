import Hackathon from "../models/Hackathon.js";
import { generateCertificateBuffer } from "../utils/pdf/certificate.js";

export async function downloadCertificate(req, res) {
  const { hackathonId } = req.params;
  const hack = await Hackathon.findById(hackathonId);
  if (!hack) return res.status(404).json({ message: "Hackathon not found" });

  // For demo: participation certificate for logged-in user
  const buf = await generateCertificateBuffer({
    name: req.user.name,
    hackathonTitle: hack.title,
    award: "Participation",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="certificate-${hack._id}.pdf"`);
  res.send(buf);
}