// utils/generateIdCard.js
// ID Card Generation Logic - Separated from UI

export const CARD_WIDTH = 1012;
export const CARD_HEIGHT = 1536;

/**
 * Generate ID card with user photo and details
 * @param {Object} params - Generation parameters
 * @param {string} params.templateSrc - Path to template image
 * @param {string} params.userImageSrc - User photo data URL
 * @param {string} params.name - User's full name
 * @param {string} params.team - Team name (optional)
 * @param {string} params.teamPosition - Team position (optional)
 * @param {string} params.role - User role (mentor, volunteer, etc.)
 * @returns {Promise<string>} Data URL of generated ID card
 */
export async function generateIdCard({
    templateSrc,
    userImageSrc,
    name,
    team,
    teamPosition,
    role,
}) {
    // Load template first to get its natural dimensions
    const template = new Image();
    template.crossOrigin = 'anonymous';
    template.src = templateSrc;
    await new Promise((resolve, reject) => {
        template.onload = resolve;
        template.onerror = reject;
    });

    // Create canvas with template's natural dimensions
    const canvas = document.createElement('canvas');
    canvas.width = template.width;
    canvas.height = template.height;
    const ctx = canvas.getContext('2d');

    // Draw the full template at its natural dimensions
    ctx.drawImage(template, 0, 0);

    // Load user image
    const userImg = new Image();
    userImg.crossOrigin = 'anonymous';
    userImg.src = userImageSrc;
    await new Promise((resolve, reject) => {
        userImg.onload = resolve;
        userImg.onerror = reject;
    });

    // ---- PHOTO BOX PLACEMENT ----
    // Template has both front and back cards side-by-side
    // Front card (left side) has the white/orange bordered photo box
    // Fine-tuned coordinates to fit perfectly inside the white box

    const photoSize = 224; // Size to fit inside the white box
    const photoX = 160; // X position on front card (adjusted)
    const photoY = 229; // Y position from top (moved up)

    // Draw user photo with clipping to prevent overflow
    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoSize, photoSize + 8); // Increased height to fill more space
    ctx.clip();

    // Cover-fit: scale to fill entire box while maintaining aspect ratio
    const scale = Math.max(
        photoSize / userImg.width,
        photoSize / userImg.height
    );

    const drawWidth = userImg.width * scale;
    const drawHeight = userImg.height * scale;

    // Center the scaled image within the photo box
    ctx.drawImage(
        userImg,
        photoX + (photoSize - drawWidth) / 2,
        photoY + (photoSize - drawHeight) / 2,
        drawWidth,
        drawHeight
    );

    ctx.restore();

    // ---- TEXT RENDERING ----
    // Position text below the photo on the front card
    const textStartY = photoY + photoSize + 60;
    const textStartX = photoX + photoSize / 2;
    const maxTextWidth = 220; // Stricter width constraint to prevent overflow

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF8A2E'; // Orange color

    // Draw name with aggressive auto-sizing for long names
    let nameFontSize = 38; // Increased from 32 for better readability
    ctx.font = `bold ${nameFontSize}px "Fira Code", monospace`;

    // More aggressive sizing - reduce until it fits
    while (ctx.measureText(name).width > maxTextWidth && nameFontSize > 24) {
        nameFontSize -= 1; // Reduce by 1px for finer control
        ctx.font = `bold ${nameFontSize}px "Fira Code", monospace`;
    }

    ctx.fillText(name, textStartX, textStartY - 10);

    // Draw team text ONLY for volunteers and participants
    if (['student_participant', 'volunteer'].includes(role) && team) {
        // Format: "Event Team - Position" (team comes first, then position)
        let teamText = team;
        if (teamPosition) {
            teamText = `${team} Team-${teamPosition}`;
        }

        const teamFontSize = Math.floor(nameFontSize * 1); // Same size as name
        ctx.font = `600 ${teamFontSize}px "Fira Code", monospace`;

        // Ensure team text also fits
        let currentTeamSize = teamFontSize;
        while (ctx.measureText(teamText).width > maxTextWidth && currentTeamSize > 20) {
            currentTeamSize -= 1;
            ctx.font = `600 ${currentTeamSize}px "Fira Code", monospace`;
        }

        // Increased spacing from 12 to 18 for better separation
        ctx.fillText(teamText, textStartX - 5, textStartY - 22 + nameFontSize + 18);
    }

    // Return final image as data URL
    return canvas.toDataURL('image/png', 1.0);
}

/**
 * Get template image path based on user type
 * @param {string} userType - User role type
 * @returns {string} Path to template image
 */
export function getTemplateImage(userType) {
    const templates = {
        mentor: '/mentor.png',
        student_coordinator: '/student_coordinator.png',
        volunteer: '/volunteer.png',
        student_participant: '/partcipant.png'
    };
    return templates[userType] || '/mentor.png';
}