import * as XLSX from "xlsx"


export function exportParticipantsToExcel(participants: any[], checkIns: any[]) {
  // Create a map of check-ins by participant ID
  const checkInMap = new Map()
  checkIns.forEach((checkIn) => {
    if (checkIn.type === "check-in") {
      checkInMap.set(checkIn.participantId, checkIn)
    }
  })

  // Prepare data for export
  const exportData = participants.map((participant) => {
    const checkIn = checkInMap.get(participant.id)
    return {
      "Participant ID": participant.id,
      Name: participant.name,
      Email: participant.email,
      College: participant.college,
      "College ID": participant.collegeId,
      Phone: participant.phone,
      "Registered At": participant.registeredAt?.toDate?.()?.toLocaleString() || "N/A",
      "Checked In": checkIn ? "Yes" : "No",
      "Check-in Time": checkIn?.checkedInAt?.toDate?.()?.toLocaleString() || "N/A",
    }
  })

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Participants")

  // Generate filename with current date
  const date = new Date().toISOString().split("T")[0]
  const filename = `EventEase_Participants_${date}.xlsx`

  // Save file
  XLSX.writeFile(wb, filename)
}

export function exportVolunteersToExcel(volunteers: any[]) {
  const exportData = volunteers.map((volunteer) => ({
    "Volunteer ID": volunteer.volunteerId,
    Name: volunteer.name,
    Email: volunteer.email,
    "Registered At": volunteer.registeredAt?.toDate?.()?.toLocaleString() || "N/A",
    "Last Login": volunteer.lastLogin?.toDate?.()?.toLocaleString() || "Never",
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)
  XLSX.utils.book_append_sheet(wb, ws, "Volunteers")

  const date = new Date().toISOString().split("T")[0]
  const filename = `EventEase_Volunteers_${date}.xlsx`

  XLSX.writeFile(wb, filename)
}
