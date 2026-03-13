/* ==========================================================================
   Workshop Registration & Survey Forms - JavaScript
   ========================================================================== */

// API Configuration
const API_URL = 'http://localhost:3000/api'; // Change this to your server URL

/* ==========================================================================
   Registration Functions
   ========================================================================== */

function openRegistrationModal(eventId, eventTitle, eventDate) {
    // First show the informed consent modal
    const consentModal = document.getElementById('consentModal');

    // Store event details for later use
    window.currentEventDetails = { eventId, eventTitle, eventDate };

    // Reset consent form
    document.getElementById('consentForm').reset();

    // Show consent modal
    consentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function proceedToRegistration(consentGiven) {
    // Close consent modal
    const consentModal = document.getElementById('consentModal');
    consentModal.classList.remove('active');

    // Store consent status
    window.userConsentGiven = consentGiven;

    // Open registration modal with stored event details
    const { eventId, eventTitle, eventDate } = window.currentEventDetails;
    const modal = document.getElementById('registrationModal');

    // Set event details
    document.getElementById('reg-eventId').value = eventId;
    document.getElementById('reg-eventTitle').value = eventTitle;
    document.getElementById('reg-eventDate').value = eventDate;
    document.getElementById('reg-consent').value = consentGiven ? 'accepted' : 'declined';

    // Display event details
    const eventDetails = document.getElementById('event-details');
    eventDetails.innerHTML = `
        <h3>${eventTitle}</h3>
        <p><i class="fas fa-calendar"></i> <strong>Date:</strong> ${eventDate}</p>
        ${!consentGiven ? '<p style="color: #E57200; font-weight: 600;"><i class="fas fa-info-circle"></i> You may still register, but your data will not be used for research purposes.</p>' : ''}
    `;

    // Reset form
    document.getElementById('registrationForm').reset();
    // Restore event details and consent
    document.getElementById('reg-eventId').value = eventId;
    document.getElementById('reg-eventTitle').value = eventTitle;
    document.getElementById('reg-eventDate').value = eventDate;
    document.getElementById('reg-consent').value = consentGiven ? 'accepted' : 'declined';

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeConsentModal() {
    const modal = document.getElementById('consentModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function toggleStudentFields() {
    const affiliation = document.getElementById('affiliation').value;
    const studentFields = document.getElementById('studentFields');

    if (affiliation === 'undergraduate' || affiliation === 'graduate') {
        studentFields.style.display = 'block';
    } else {
        studentFields.style.display = 'none';
    }
}

// Handle registration form submission
document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            try {
                // Gather form data
                const formData = new FormData(this);
                const data = {
                    eventId: formData.get('eventId'),
                    eventTitle: formData.get('eventTitle'),
                    eventDate: formData.get('eventDate'),
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    affiliation: formData.get('affiliation'),
                    studentId: formData.get('studentId'),
                    department: formData.get('department'),
                    interests: formData.getAll('interests'),
                    dietaryRestrictions: formData.get('dietaryRestrictions'),
                    accessibility: formData.get('accessibility'),
                    comments: formData.get('comments'),
                    // Research consent and survey data
                    researchConsent: formData.get('consent'),
                    preSurvey: {
                        aiFamiliarity: formData.get('aiFamiliarity'),
                        websiteFamiliarity: formData.get('websiteFamiliarity')
                    },
                    postSurvey: {
                        aiUnderstanding: parseInt(formData.get('aiUnderstanding')),
                        websiteConfidence: parseInt(formData.get('websiteConfidence'))
                    },
                    followUpEmail: formData.get('followUpEmail')
                };

                // Validate student ID if provided
                if (data.studentId && data.studentId.trim() !== '') {
                    if (!/^[0-9]{7}$/.test(data.studentId)) {
                        showError('Student ID must be exactly 7 digits (without the "s" prefix)');
                        submitButton.disabled = false;
                        submitButton.innerHTML = '<i class="fas fa-check"></i> Complete Registration';
                        return;
                    }
                }

                // Submit to API
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showSuccess('Registration successful! Check your email for confirmation.');
                    closeRegistrationModal();

                    // Save registration ID to localStorage for survey
                    localStorage.setItem(`reg_${data.eventId}`, result.registrationId);
                } else {
                    showError(result.message || 'Registration failed. Please try again.');
                }

            } catch (error) {
                console.error('Registration error:', error);
                showError('Unable to submit registration. Please check your connection and try again.');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-check"></i> Complete Registration';
            }
        });
    }

    // Initialize star ratings
    initializeStarRatings();
});

/* ==========================================================================
   Survey Functions
   ========================================================================== */

function openSurveyModal(registrationId, eventId, eventTitle) {
    const modal = document.getElementById('surveyModal');

    // Set survey details
    document.getElementById('survey-registrationId').value = registrationId;
    document.getElementById('survey-eventId').value = eventId;
    document.getElementById('survey-eventTitle').value = eventTitle;

    // Reset form
    document.getElementById('surveyForm').reset();
    resetStarRatings();

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSurveyModal() {
    const modal = document.getElementById('surveyModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function initializeStarRatings() {
    const starContainers = document.querySelectorAll('.star-rating');

    starContainers.forEach(container => {
        const stars = container.querySelectorAll('i');
        const field = container.dataset.field;
        const hiddenInput = document.querySelector(`input[name="rating-${field}"]`);

        stars.forEach((star, index) => {
            // Hover effect
            star.addEventListener('mouseenter', function() {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.add('hover');
                        s.classList.replace('far', 'fas');
                    } else {
                        s.classList.remove('hover');
                        if (!s.classList.contains('selected')) {
                            s.classList.replace('fas', 'far');
                        }
                    }
                });
            });

            // Click to select
            star.addEventListener('click', function() {
                const value = this.dataset.value;
                container.dataset.rating = value;
                hiddenInput.value = value;

                stars.forEach((s, i) => {
                    s.classList.remove('selected', 'hover');
                    if (i < value) {
                        s.classList.replace('far', 'fas');
                        s.classList.add('selected');
                    } else {
                        s.classList.replace('fas', 'far');
                    }
                });
            });
        });

        // Reset on mouse leave
        container.addEventListener('mouseleave', function() {
            const currentRating = parseInt(this.dataset.rating) || 0;
            stars.forEach((s, i) => {
                s.classList.remove('hover');
                if (i < currentRating) {
                    s.classList.replace('far', 'fas');
                } else {
                    s.classList.replace('fas', 'far');
                }
            });
        });
    });
}

function resetStarRatings() {
    const starContainers = document.querySelectorAll('.star-rating');
    starContainers.forEach(container => {
        container.dataset.rating = '0';
        const stars = container.querySelectorAll('i');
        stars.forEach(star => {
            star.classList.remove('selected', 'hover');
            star.classList.replace('fas', 'far');
        });
    });

    // Reset hidden inputs
    document.querySelectorAll('input[name^="rating-"]').forEach(input => {
        input.value = '';
    });
}

// Handle survey form submission
document.addEventListener('DOMContentLoaded', function() {
    const surveyForm = document.getElementById('surveyForm');

    if (surveyForm) {
        surveyForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            try {
                // Gather form data
                const formData = new FormData(this);
                const data = {
                    registrationId: formData.get('registrationId'),
                    eventId: formData.get('eventId'),
                    eventTitle: formData.get('eventTitle'),
                    ratings: {
                        overall: parseInt(formData.get('rating-overall')),
                        content: parseInt(formData.get('rating-content')),
                        presenter: parseInt(formData.get('rating-presenter')),
                        organization: parseInt(formData.get('rating-organization')) || null,
                        materials: parseInt(formData.get('rating-materials')) || null,
                        relevance: parseInt(formData.get('rating-relevance')) || null
                    },
                    feedback: {
                        liked: formData.get('liked'),
                        improve: formData.get('improve'),
                        learned: formData.get('learned'),
                        apply: formData.get('apply')
                    },
                    futureInterests: formData.getAll('futureInterests'),
                    recommendations: formData.get('recommendations'),
                    wouldRecommend: formData.get('wouldRecommend') === 'true',
                    contactPermission: formData.get('contactPermission') === 'true'
                };

                // Validate required ratings
                if (!data.ratings.overall || !data.ratings.content || !data.ratings.presenter) {
                    showError('Please provide ratings for all required questions.');
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Survey';
                    return;
                }

                // Submit to API
                const response = await fetch(`${API_URL}/survey`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showSuccess('Thank you for your feedback! Your survey has been submitted.');
                    closeSurveyModal();

                    // Remove registration ID from localStorage
                    localStorage.removeItem(`reg_${data.eventId}`);
                } else {
                    showError(result.message || 'Survey submission failed. Please try again.');
                }

            } catch (error) {
                console.error('Survey submission error:', error);
                showError('Unable to submit survey. Please check your connection and try again.');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Survey';
            }
        });
    }
});

/* ==========================================================================
   Utility Functions
   ========================================================================== */

function showSuccess(message) {
    const toast = document.getElementById('successMessage');
    const text = document.getElementById('successText');
    text.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function showError(message) {
    const toast = document.getElementById('errorMessage');
    const text = document.getElementById('errorText');
    text.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Likert scale handling
function setLikertValue(questionName, value) {
    // Set the hidden input value
    document.querySelector(`input[name="${questionName}"]`).value = value;

    // Update visual feedback
    const container = document.querySelector(`[data-question="${questionName}"]`);
    if (container) {
        const buttons = container.querySelectorAll('.likert-option');
        buttons.forEach((btn, index) => {
            if (index + 1 === value) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }
}

// Close modals on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeConsentModal();
        closeRegistrationModal();
        closeSurveyModal();
    }
});

// Close modals on background click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeConsentModal();
        closeRegistrationModal();
        closeSurveyModal();
    }
});

/* ==========================================================================
   Export Functions for Global Use
   ========================================================================== */

window.openRegistrationModal = openRegistrationModal;
window.closeRegistrationModal = closeRegistrationModal;
window.closeConsentModal = closeConsentModal;
window.proceedToRegistration = proceedToRegistration;
window.toggleStudentFields = toggleStudentFields;
window.openSurveyModal = openSurveyModal;
window.closeSurveyModal = closeSurveyModal;
window.setLikertValue = setLikertValue;
