import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_text_summary_success(client: AsyncClient, auth_headers, mock_db, mock_openai, mock_file_write):
    '''Test successful text summarization'''
    # Text with more than 100 characters
    test_text = '''
    Artificial Intelligence (AI) is rapidly transforming various industries and aspects of our daily lives. 
    From healthcare to transportation, AI systems are being deployed to solve complex problems and improve 
    efficiency. Machine learning algorithms can now diagnose diseases, predict weather patterns, and even 
    compose music. However, this technological advancement also raises important ethical questions about 
    privacy, job displacement, and the need for responsible AI development. As we move forward, it's 
    crucial to balance innovation with careful consideration of AI's societal impact.
    '''
    
    response = await client.post(
        '/summary/summary_text',
        json={
            'text': test_text,
            'language': 'English'
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert 'task_id' in data
    assert data['status'] == 'queued'
    assert data['language'] == 'English'
    assert data['text_info']['text_length'] == len(test_text.strip())


@pytest.mark.asyncio
async def test_text_summary_too_short(client: AsyncClient, auth_headers, mock_db):
    '''Test text summarization with text that's too short'''
    short_text = 'This is too short.'
    
    response = await client.post(
        '/summary/summary_text',
        json={
            'text': short_text,
            'language': 'English'
        },
        headers=auth_headers
    )
    
    assert response.status_code == 400
    assert 'too short' in response.json()['detail'].lower()


@pytest.mark.asyncio
async def test_text_summary_too_long(client: AsyncClient, auth_headers, mock_db):
    '''Test text summarization with text that's too long'''
    # Create text longer than 50,000 characters
    long_text = 'A' * 50001
    
    response = await client.post(
        '/summary/summary_text',
        json={
            'text': long_text,
            'language': 'English'
        },
        headers=auth_headers
    )
    
    assert response.status_code == 400
    assert 'too long' in response.json()['detail'].lower()


@pytest.mark.asyncio
async def test_text_summary_unauthorized(client: AsyncClient, mock_db):
    '''Test text summarization without authentication'''
    test_text = 'A' * 200  # Valid length text
    
    response = await client.post(
        '/summary/summary_text',
        json={
            'text': test_text,
            'language': 'English'
        }
    )
    
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_text_summary_with_language(client: AsyncClient, auth_headers, mock_db, mock_openai, mock_file_write):
    '''Test text summarization with different language'''
    test_text = '''
    La inteligencia artificial está transformando rápidamente diversas industrias y aspectos de nuestra vida diaria.
    Desde la atención médica hasta el transporte, los sistemas de IA se están implementando para resolver problemas
    complejos y mejorar la eficiencia. Los algoritmos de aprendizaje automático ahora pueden diagnosticar enfermedades,
    predecir patrones climáticos e incluso componer música.
    '''
    
    response = await client.post(
        '/summary/summary_text',
        json={
            'text': test_text,
            'language': 'Spanish'
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data['language'] == 'Spanish'


@pytest.mark.asyncio
async def test_text_summary_whitespace_handling(client: AsyncClient, auth_headers, mock_db, mock_openai, mock_file_write):
    '''Test that whitespace is properly handled'''
    # Text with lots of whitespace that should still be > 100 chars when stripped
    test_text = '    ' + ('Word ' * 30) + '    '
    
    response = await client.post(
        '/summary/summary_text',
        json={
            'text': test_text,
            'language': 'English'
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data['text_info']['text_length'] == len(test_text.strip())