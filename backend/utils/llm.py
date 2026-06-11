from langchain_openai import ChatOpenAI
from .config import settings


openai_api_key = settings.OPENAI_API_KEY
openai_model_name = settings.OPENAI_MODEL_NAME

llm = ChatOpenAI(
        temperature=0.0,
        openai_api_key=openai_api_key,
        model_name=openai_model_name,
        # base_url='http://localhost:1234/v1',
        streaming=False
    )

# Format-specific prompt templates
FORMAT_PROMPTS = {
    'standard': '''
Your task is to create a **clear, structured, and informative summary** in **{target_language}** based on this text content.

Follow these rules:
- Focus only on **meaningful content**: remove filler words, repetitions, informal phrases, jokes, and advertisements.
- Extract only the **main ideas, facts, key points, features, and conclusions**.
- If the content is a review or comparison — organize information by topics like: 'Design', 'Screen', 'Battery', 'Functions', 'Accessories', etc.
- If it's a general discussion — group the ideas thematically by topic or argument.
- Write from a neutral, factual point of view.
- Avoid vagueness and subjectivity — focus on **concrete** information.

Format the result using **Markdown**, following these formatting rules:
- Use `##` for main sections
- Use `###` for subsections (if needed)
- Use bullet points (`*`) for listing facts or features
- Use `**bold**` to highlight key terms, names, numbers, or features
- Output only the summary, no explanation or intro

Make the summary **easy to read**, professional, and useful.
    ''',
    
    'bullets': '''
Your task is to create a **bullet-point summary** in **{target_language}** based on this text content.

Follow these rules:
- Extract the most important points and present them as clear bullet points
- Each bullet point should be concise but informative (1-2 sentences max)
- Focus on **key facts, main ideas, important features, and conclusions**
- Remove filler content, repetitions, and irrelevant details
- Write from a neutral, factual point of view

Format as a clean bullet list:
- Use `*` for each main point
- Use `**bold**` to highlight key terms, names, or numbers
- Group related points under section headers if needed (`## Section Name`)
- Output only the bullet points, no explanation or intro

Make each point valuable and easy to scan.
    ''',
    
    'takeaways': '''
Your task is to identify and present the **key takeaways** in **{target_language}** from this text content.

Focus on:
- **Main conclusions** and final thoughts
- **Important insights** and learning points
- **Actionable information** that readers can apply
- **Key facts or statistics** worth remembering
- **Core recommendations** or advice given
- **IMPORTANT**: Identify the main topic/subject of the content and use it in the header

Format the takeaways as:
- Use `## [Main Topic/Subject] - Key Takeaways` as the header (e.g., "## Python Programming - Key Takeaways" or "## Marketing Strategy - Key Takeaways")
- Present 3-7 main takeaways as numbered list items
- Each takeaway should be 1-2 sentences
- Use `**bold**` for important terms or numbers
- Write in a clear, direct style

Output only the takeaways, no explanation or intro.
    ''',
    
    'executive': '''
Your task is to create an **Executive Summary** in **{target_language}** based on this text content.

**IMPORTANT**: ALL section headers and content must be in {target_language}.

For section headers, use appropriate translations:
- English: "Executive Summary", "Problem/Situation", "Key Points", "Recommendations/Conclusions", "Impact/Implications"
- Russian: "Исполнительное резюме", "Проблема/Ситуация", "Ключевые моменты", "Рекомендации/Выводы", "Влияние/Последствия"
- Other languages: translate section headers appropriately

Structure the summary with these sections:

## Executive Summary (translated to target language)

### Problem/Situation Section (translated to target language)
- Briefly describe the main issue, topic, or situation being discussed

### Key Points Section (translated to target language)
- List 3-5 most important points or findings
- Focus on facts, data, and concrete information

### Recommendations/Conclusions Section (translated to target language)
- Summarize the main recommendations or conclusions
- Include any proposed solutions or next steps

### Impact/Implications Section (translated to target language)
- Describe the significance or potential impact
- Who this affects and why it matters

Follow these formatting rules:
- Keep each section concise but informative
- Use `**bold**` for key terms, numbers, and critical points
- Write in professional, business-oriented language
- Focus on actionable insights and concrete outcomes
- Output only the executive summary, no explanation or intro
    ''',
    
    'qa': '''
Your task is to create a **Q&A format summary** in **{target_language}** based on this text content.

Create 5-8 relevant questions and answers that capture the essential information:

Follow these rules:
- Questions should cover the most important topics discussed
- Answers should be concise but complete (2-4 sentences each)
- Focus on **who, what, when, where, why, and how**
- Include key facts, figures, and conclusions
- Write questions that someone would naturally ask about this content
- **IMPORTANT**: Identify the main topic/subject of the content and use it in the header

Format as:
- Use `## [Main Topic/Subject] - Q&A` as the header (e.g., "## iPhone 15 Review - Q&A" or "## React Hooks Tutorial - Q&A")
- Each Q&A pair should be formatted as:
  `**Q: [Question]**`
  `A: [Answer]`
- Use `**bold**` for important terms or numbers in answers
- Order questions from most general to more specific

Output only the Q&A pairs, no explanation or intro.
    ''',
    
    'action_items': '''
Your task is to extract **actionable items and steps** in **{target_language}** from this text content.

Identify and organize:
- **Specific actions** or steps mentioned
- **Tasks** that can be completed
- **Recommendations** that can be implemented
- **Instructions** or procedures described
- **Goals** or objectives outlined
- **IMPORTANT**: Identify the main topic/subject of the content and use it in the header

Format as:
- Use `## [Main Topic/Subject] - Action Items` as the header (e.g., "## Website Redesign - Action Items" or "## Fitness Plan - Action Items")
- Present as a prioritized list using numbers
- Group related actions under subheadings if needed
- Each action item should:
  - Be specific and actionable
  - Include relevant details (timeframes, requirements, etc.)
  - Use `**bold**` for key terms or priorities
- Add `Priority: High/Medium/Low` labels where appropriate

If no clear action items exist, focus on **key recommendations** or **next steps** that could be taken.

Output only the action items, no explanation or intro.
    ''',
    
    'pros_cons': '''
Your task is to create a **Pros & Cons analysis** in **{target_language}** based on this text content.

**IMPORTANT**: ALL section headers and content must be in {target_language}.

For section headers, use appropriate translations:
- English: "Pros & Cons Analysis", "Pros (Advantages)", "Cons (Disadvantages)", "Additional Considerations"
- Russian: "Анализ плюсов и минусов", "Плюсы (Преимущества)", "Минусы (Недостатки)", "Дополнительные соображения"
- Other languages: translate section headers appropriately

Analyze the content to identify:
- **Advantages, benefits, positive aspects**
- **Disadvantages, drawbacks, negative aspects**
- **Balanced viewpoints** on the topic

Format as:
## Pros & Cons Analysis (translated to target language)

### ✅ Pros Section (translated to target language)
- List positive aspects, benefits, or advantages
- Include supporting facts or reasoning
- Use `**bold**` for key benefits

### ❌ Cons Section (translated to target language)
- List negative aspects, drawbacks, or limitations
- Include supporting facts or reasoning  
- Use `**bold**` for key issues

### 📝 Additional Considerations Section (translated to target language)
- Any neutral points or additional context
- Conditions where pros/cons might vary
- Important nuances or exceptions

If the content doesn't have clear pros and cons, focus on **different perspectives** or **trade-offs** discussed.

Output only the analysis, no explanation or intro.
    ''',
    
    'timeline': '''
Your task is to create a **timeline summary** in **{target_language}** based on this text content.

Extract and organize information chronologically:
- **Events in order** of occurrence
- **Processes or steps** in sequence
- **Historical progression** of topics discussed
- **Development stages** or phases
- **Before/during/after scenarios**

Format as:
## Timeline

Use one of these approaches based on the content:
- **Dated events**: `**[Date/Time]**: Event description`
- **Sequential steps**: `**Step 1**: Action description`
- **Phases**: `**Phase 1 - [Name]**: Description`
- **Periods**: `**Early Stage**: What happened`

Guidelines:
- Present in chronological order
- Use `**bold**` for time markers, dates, or phase names
- Include key details for each timeline point
- Focus on significant events, changes, or milestones
- Add context where helpful

If content lacks clear chronology, organize by **logical sequence** or **cause-and-effect relationships**.

Output only the timeline, no explanation or intro.
    ''',
    
    'study_guide': '''
Your task is to create a **study guide** in **{target_language}** based on this text content.

Organize the material for learning and review:
- **IMPORTANT**: Identify the main topic/subject of the content and use it in the header
- **IMPORTANT**: ALL section headers and labels must be in {target_language}

## [Main Topic/Subject] - Study Guide

Create sections with headers in the target language:
- For English: use "Main Topics Covered", "Key Concepts & Terms", "Important Facts & Figures", "Core Principles/Ideas", "Study Questions", "Summary Points"
- For Russian: use "Основные темы", "Ключевые понятия и термины", "Важные факты и цифры", "Основные принципы и идеи", "Вопросы для изучения", "Основные выводы"
- For other languages: translate section headers appropriately

Structure the study guide as follows:
1. **Main Topics Section** (with emoji 📚):
   - List the primary subjects or themes
   - Use bullet points with brief descriptions

2. **Key Concepts Section** (with emoji 🔑):
   - Important terms, definitions, or concepts
   - Technical terms or specialized vocabulary
   - Use format: `**Term**: Definition or explanation`

3. **Facts & Figures Section** (with emoji 📊):
   - Key statistics, numbers, or data points
   - Significant facts worth memorizing
   - Dates, measurements, or quantitative information

4. **Core Principles Section** (with emoji 💡):
   - Main theories, principles, or methodologies discussed
   - Fundamental concepts or frameworks
   - Cause-and-effect relationships

5. **Study Questions Section** (with emoji ❓):
   - 3-5 questions that test understanding of the material
   - Mix of factual recall and conceptual understanding
   - Format: `Q: [Question]` (no answers needed)
   - Questions should be in the target language

6. **Summary Points Section** (with emoji 🎯):
   - 3-5 most important things to remember
   - Key takeaways for review

Use `**bold**` for important terms and concepts throughout.
Output only the study guide, no explanation or intro.
    '''
}

async def generate_summary(content_text: str, target_language: str, format_type: str = 'standard') -> str:
    '''Generate a summary in the specified format and language'''
    
    # Get the appropriate prompt template
    prompt_template = FORMAT_PROMPTS.get(format_type, FORMAT_PROMPTS['standard'])
    
    # Create the full prompt
    full_prompt = f'''
Here is the text content to summarize:

{content_text}

{prompt_template.format(target_language=target_language)}
    '''
    
    # Generate summary using LLM
    summary = await llm.ainvoke(full_prompt)

    # Optional: Save to file for debugging (can be removed later)
    with open('summary.md', 'w', encoding='utf-8') as f:
        f.write(f'Format: {format_type}\nLanguage: {target_language}\n\n{summary.content}')

    return summary.content