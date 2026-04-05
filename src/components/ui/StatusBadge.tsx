type Status = "approved" | "pending" | "revision" | "draft"

const config = {
  approved: { bg: "bg-status-approved", text: "text-status-approved-text", label: "Approved" },
  pending:  { bg: "bg-status-pending",  text: "text-status-pending-text",  label: "Pending Review" },
  revision: { bg: "bg-status-revision", text: "text-status-revision-text", label: "Needs Revision" },
  draft:    { bg: "bg-status-draft",    text: "text-status-draft-text",    label: "Draft" },
}

export function StatusBadge({ status }: { status: Status }) {
  const { bg, text, label } = config[status]
  return (
    <span className={`${bg} ${text} text-xs font-semibold px-2.5 py-1 rounded-full`}>
      {label}
    </span>
  )
}
