import Input from '../ui/Input.jsx'
export default function RecipientSearch({ value, onChange }) { return <div className="recipient-search"><Input id="recipient-search" label="Search by name, UPI ID or phone number" placeholder="Search people" value={value} onChange={(event) => onChange(event.target.value)} /><span className="recipient-search__icon" aria-hidden="true">/</span></div> }
