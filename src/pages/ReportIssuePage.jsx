import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Check, Send, MapPin, Camera, AlertTriangle, AlertCircle, 
  CheckCircle2, Shield, EyeOff, Sparkles, Droplets, Wifi, Building2, 
  Utensils, Bus, SquareParking, ShieldAlert, Wrench, Hammer, MoreHorizontal,
  Users, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { detectPotentialDuplicates } from '../services/duplicateDetector';

export const CATEGORIES = [
  { id: 'water', name: 'Water', icon: Droplets, hours: 3 },
  { id: 'wifi', name: 'Wi-Fi / Network', icon: Wifi, hours: 2 },
  { id: 'cleanliness', name: 'Cleanliness', icon: Sparkles, hours: 4 },
  { id: 'facilities', name: 'Facilities', icon: Building2, hours: 8 },
  { id: 'food', name: 'Food / Cafeteria', icon: Utensils, hours: 2 },
  { id: 'transport', name: 'Transport', icon: Bus, hours: 6 },
  { id: 'parking', name: 'Parking', icon: SquareParking, hours: 12 },
  { id: 'safety', name: 'Safety', icon: ShieldAlert, hours: 1 },
  { id: 'equipment', name: 'Equipment', icon: Wrench, hours: 5 },
  { id: 'infrastructure', name: 'Infrastructure', icon: Hammer, hours: 24 },
  { id: 'other', name: 'Other Issue', icon: MoreHorizontal, subtitle: 'General inquiries or multi-category needs', hours: 12 }
];

const URGENCY_OPTIONS = [
  {
    id: 'low',
    title: 'Not urgent',
    desc: 'A minor issue that can be handled normally',
    icon: CheckCircle2,
    boxClass: 'low'
  },
  {
    id: 'medium',
    title: 'Needs attention',
    desc: 'The issue is affecting normal use',
    icon: AlertTriangle,
    boxClass: 'medium'
  },
  {
    id: 'high',
    title: 'Urgent',
    desc: 'May affect safety or significantly disrupt people',
    icon: AlertCircle,
    boxClass: 'high'
  }
];

export function ReportIssuePage({ onBack, onSuccess, onSelectIssue }) {
  const { currentUser, organization } = useAuth();
  const { issues, createIssue, toggleConfirmIssue } = useIssues();

  // Form State
  const [selectedCategory, setSelectedCategory] = useState('water');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live duplicate detection
  const potentialDuplicates = useMemo(() => {
    return detectPotentialDuplicates(
      { title, category: selectedCategory, location: locationText },
      issues
    );
  }, [title, selectedCategory, locationText, issues]);

  // Selected category SLA
  const currentCatMeta = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide an issue title.');
      return;
    }
    if (!locationText.trim()) {
      alert('Please indicate the location of the problem.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newIssue = createIssue({
        title,
        description,
        category: selectedCategory,
        locationText,
        urgency,
        isAnonymous,
        photoUrl: photoPreview
      });
      setIsSubmitting(false);
      onSuccess && onSuccess(newIssue.id);
    }, 400);
  };

  return (
    <div className="page-container" style={{ maxWidth: '640px' }}>
      <div className="report-form-container">
        {/* Header Bar (Screenshot 3) */}
        <div className="form-header-row">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>Report an Issue</span>
          </button>
          <span className="org-chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            New Ticket
          </span>
        </div>

        {/* Title Group (Screenshot 3) */}
        <div className="form-title-group">
          <h2>What's the problem?</h2>
          <p>Tell us what needs attention. We'll help get it to the right people.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Category Selection Grid (Screenshot 3) */}
          <div className="form-group">
            <div className="form-section-title">
              <span>What type of problem is this? *</span>
              <span className="step-indicator">STEP 1 OF 6</span>
            </div>

            <div className="category-selection-grid">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const isOther = cat.id === 'other';

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`category-choice-card ${isSelected ? 'selected' : ''} ${isOther ? 'full-width' : ''}`}
                  >
                    <div className="category-choice-left">
                      <div className="category-icon-box">
                        <Icon size={18} />
                      </div>
                      <span className="category-title">{cat.name}</span>
                    </div>
                    {isSelected && <Check size={18} color="#1d4ed8" strokeWidth={2.5} />}
                    {isOther && cat.subtitle && (
                      <p className="category-subtitle">{cat.subtitle}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Short Title (Screenshot 3) */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="issue-title">Give it a short title *</label>
              <span className="char-counter">{title.length} / 80</span>
            </div>
            <input
              id="issue-title"
              type="text"
              className="input-text"
              placeholder="e.g. Water cooler leaking in pantry"
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* DUPLICATE DETECTION INTERCEPTION BANNER */}
          {potentialDuplicates.length > 0 && (
            <div className="duplicate-alert-banner">
              <div className="duplicate-banner-header">
                <Info size={16} />
                <span>Existing issue detected nearby ({potentialDuplicates[0].confidence}% match)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#78350f' }}>
                Someone has already reported a similar issue. To get it resolved faster, confirm this existing issue instead of creating a duplicate:
              </p>
              {potentialDuplicates.slice(0, 2).map(({ issue, confidence }) => (
                <div key={issue.id} className="duplicate-match-item">
                  <div className="duplicate-match-text">
                    <h5>{issue.title}</h5>
                    <p>{issue.location?.fullText} • {issue.affectedCount} people affected</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                      onClick={() => {
                        toggleConfirmIssue(issue.id);
                        onSelectIssue && onSelectIssue(issue.id);
                      }}
                    >
                      Confirm Existing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Tell Us More (Screenshot 4) */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="issue-desc">Tell us more</label>
              <span className="optional-badge">Optional if title is clear</span>
            </div>
            <textarea
              id="issue-desc"
              rows={3}
              className="input-textarea"
              placeholder="Provide extra details such as specific equipment number or observed symptoms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Step 4: Where is the problem? (Screenshot 4) */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="issue-location">Where is the problem? *</label>
            </div>
            <div className="input-with-icon">
              <MapPin size={18} />
              <input
                id="issue-location"
                type="text"
                className="input-text"
                placeholder="e.g. Block B, 2nd Floor, Room 204"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                required
              />
            </div>
            {/* Quick zone pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {organization.zones.slice(0, 4).map(z => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setLocationText(z)}
                  style={{
                    fontSize: '0.72rem',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  + {z}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: How urgent is this? (Screenshot 4) */}
          <div className="form-group">
            <div className="form-label-row">
              <label>How urgent is this?</label>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '10px' }}>
              This helps the team understand how quickly the issue may need attention.
            </p>

            <div className="urgency-choice-list">
              {URGENCY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = urgency === opt.id;

                return (
                  <div
                    key={opt.id}
                    className={`urgency-choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setUrgency(opt.id)}
                  >
                    <div className="urgency-choice-left">
                      <div className={`urgency-icon-box ${opt.boxClass}`}>
                        <Icon size={18} strokeWidth={2.4} />
                      </div>
                      <div className="urgency-text-col">
                        <h4>{opt.title}</h4>
                        <p>{opt.desc}</p>
                      </div>
                    </div>
                    <div className="radio-indicator"></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 6: Identity Preferences (Screenshot 5) */}
          <div className="form-group">
            <div className="form-label-row">
              <label>How would you like to report this?</label>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '10px' }}>
              Choose your identity visibility preferences for this ticket.
            </p>

            {/* With my identity */}
            <div
              className={`identity-choice-card ${!isAnonymous ? 'selected' : ''}`}
              onClick={() => setIsAnonymous(false)}
            >
              <div className="identity-choice-left">
                <div className="user-avatar-bubble" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                  {currentUser.initials}
                </div>
                <div className="identity-text">
                  <h4>
                    <span>With my identity</span>
                    <span className="org-chip" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>{currentUser.name}</span>
                  </h4>
                  <p>Your identity may be visible to authorized staff handling this issue.</p>
                </div>
              </div>
              <div className="radio-indicator"></div>
            </div>

            {/* Anonymously */}
            <div
              className={`identity-choice-card ${isAnonymous ? 'selected' : ''}`}
              onClick={() => setIsAnonymous(true)}
            >
              <div className="identity-choice-left">
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <EyeOff size={18} />
                </div>
                <div className="identity-text">
                  <h4>Anonymously</h4>
                  <p>Your identity will not be shown to issue handlers.</p>
                </div>
              </div>
              <div className="radio-indicator"></div>
            </div>
          </div>

          {/* Photo / Media Attachment Dropzone (Screenshot 5) */}
          <div className="form-group">
            <label className="photo-upload-zone">
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <Camera size={26} />
              <div className="photo-upload-title">
                {photoPreview ? 'Change photo or video' : 'Attach photo or video (Optional)'}
              </div>
              <div className="photo-upload-subtitle">PNG, JPG, or HEIC up to 10MB</div>
            </label>

            {photoPreview && (
              <div style={{ marginTop: '10px', position: 'relative' }}>
                <img
                  src={photoPreview}
                  alt="Upload preview"
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Bottom Submit Footer Bar (Screenshots 3, 4, 5) */}
          <div className="form-submit-footer">
            <div className="submit-meta-row">
              <div className="team-badge">
                <Shield size={14} color="#1d4ed8" />
                <span>Campus Operations Team</span>
              </div>
              <div>Avg resolution: ~{currentCatMeta.hours} hrs</div>
            </div>

            <button
              type="submit"
              className="btn-primary-large"
              disabled={isSubmitting}
            >
              <Send size={18} />
              <span>{isSubmitting ? 'Submitting Issue...' : 'Submit Issue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
