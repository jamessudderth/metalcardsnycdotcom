import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

// Validate OpenAI API key on startup
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OpenAI API key not found. AI features will be disabled.');
} else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
  console.error('❌ Invalid OpenAI API key format. Expected format: sk-...');
} else {
  console.log('✅ OpenAI API key configured');
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export interface DesignSuggestion {
  colorPalette: string[];
  fontRecommendations: string[];
  layoutSuggestions: string[];
  industryTips: string[];
  brandingAdvice: string;
}

export interface BusinessInfo {
  companyName: string;
  industry: string;
  role: string;
  targetAudience: string;
  brandPersonality: string;
  existingColors?: string[];
}

export async function generateDesignSuggestions(businessInfo: BusinessInfo): Promise<DesignSuggestion> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please provide your OpenAI API key to use the AI Design Assistant.');
  }
  const prompt = `As a professional graphic designer specializing in business card design, analyze the following business information and provide design recommendations:

Company: ${businessInfo.companyName}
Industry: ${businessInfo.industry}
Role: ${businessInfo.role}
Target Audience: ${businessInfo.targetAudience}
Brand Personality: ${businessInfo.brandPersonality}
${businessInfo.existingColors ? `Existing Brand Colors: ${businessInfo.existingColors.join(', ')}` : ''}

Please provide specific, actionable design recommendations in JSON format:
{
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "fontRecommendations": ["Font Name 1", "Font Name 2", "Font Name 3"],
  "layoutSuggestions": ["Layout tip 1", "Layout tip 2", "Layout tip 3"],
  "industryTips": ["Industry-specific tip 1", "Industry-specific tip 2", "Industry-specific tip 3"],
  "brandingAdvice": "Comprehensive branding advice paragraph"
}

Focus on:
- Colors that convey professionalism and match the industry
- Typography that reflects the brand personality
- Layout principles for business cards
- Industry-specific design considerations
- How to appeal to the target audience`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert graphic designer with 15 years of experience in business card design. Provide specific, actionable design recommendations in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const suggestions = JSON.parse(response.choices[0].message.content || '{}');
    return suggestions;
  } catch (error) {
    console.error('Error generating design suggestions:', error);
    throw new Error('Failed to generate design suggestions');
  }
}

export async function analyzeDesignFeedback(
  currentDesign: any,
  userQuestion: string
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please provide your OpenAI API key to use the AI Design Assistant.');
  }
  const prompt = `As a professional design consultant, analyze this business card design and provide specific feedback:

Current Design:
${JSON.stringify(currentDesign, null, 2)}

User Question/Concern: ${userQuestion}

Please provide constructive, specific feedback addressing their concern. Focus on:
- Visual hierarchy and readability
- Color harmony and professional appearance
- Typography choices and spacing
- Overall design balance
- Practical considerations for printing on metal cards
- Specific actionable improvements

Keep your response concise but helpful (under 200 words).`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional design consultant specializing in business card design. Provide specific, actionable feedback in a helpful tone."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 300
    });

    return response.choices[0].message.content || 'Unable to provide feedback at this time.';
  } catch (error) {
    console.error('Error analyzing design feedback:', error);
    throw new Error('Failed to analyze design feedback');
  }
}

export async function generateColorPalette(
  baseColor: string,
  mood: string,
  industry: string
): Promise<string[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please provide your OpenAI API key to use the AI Design Assistant.');
  }
  const prompt = `Generate a professional color palette for a business card design:

Base Color: ${baseColor}
Desired Mood: ${mood}
Industry: ${industry}

Create a 5-color palette that:
- Includes the base color or a harmonious variation
- Suits the industry and professional context
- Creates the desired mood/feeling
- Works well for business card printing
- Includes both main colors and accent colors

Respond with ONLY a JSON array of 5 hex color codes: ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a color theory expert. Generate professional color palettes in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 100
    });

    const result = JSON.parse(response.choices[0].message.content || '{"colors": []}');
    return result.colors || [];
  } catch (error) {
    console.error('Error generating color palette:', error);
    throw new Error('Failed to generate color palette');
  }
}