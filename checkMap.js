import axios from 'axios';
import { load } from 'cheerio';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// config.json 파일에서 설정 읽기
const config = JSON.parse(readFileSync('./config.json', 'utf8'));

async function crawlWebsite(url) {
    try {
        console.log(`start crawling: ${url}`);
        
        // 웹 페이지 HTML 가져오기
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        // HTML 파싱
        const $ = load(response.data);
        
        const cards = [];
        
        $('.card-deck .card').each((index, cardEl) => {
            const name = $(cardEl).find('.card-header h4').text().trim();
            const type = $(cardEl).find('.card-body li:nth-child(2)').text().trim();
            const pointText = $(cardEl).find('.card-body li:nth-child(3)').text().trim();
            const point = pointText.match(/\d+/g)?.join('') || '';
            
            console.log(name, type, point);
            
            if (name || type) {
                cards.push({ name, type, point });
            }
        });
        
        console.log(`\nFound ${cards.length} Cards`);
        
        return cards;
        
    } catch (error) {
        console.error('Crawling Error:', error.message);
        throw error;
    }
}

// mapDirectory 경로 존재 확인
if (!existsSync(config.mapDirectory)) {
    console.error(`\nError: Cannot found directory: ${config.mapDirectory}`);
    console.error('Type correct map directory at config.json');
    process.exit(1);
}


// config.json에서 URL 가져오기
const mapUrl = config.url;

crawlWebsite(mapUrl)
    .then(data => {
        console.log('\ncrawling success');

        
        // JSON 파일로 저장
        const outputPath = `${config.mapDirectory}/maps.json`;
        writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Saved Path: ${outputPath}`);
        console.log(`Total: ${data.length} maps are detected`);
        
        // 없는 맵 파일 찾기
        const missingMaps = [];
        
        data.forEach(map => {
            const mapDir = join(config.mapDirectory, map.type);
            
            // 디렉터리가 없거나 파일이 없으면
            if (!existsSync(mapDir)) {
                missingMaps.push(map);
            } else {
                // 디렉터리 내에서 {name}으로 시작하는 .map 파일 찾기
                const files = readdirSync(mapDir);
                const found = files.some(file => 
                    file.startsWith(map.name) && file.endsWith('.map')
                );
                
                if (!found) {
                    missingMaps.push(map);
                }
            }
        });
        
        // 없는 맵 정보를 JSON 파일로 저장
        const missingMapPath = `${config.mapDirectory}/missing_maps.json`;
        writeFileSync(missingMapPath, JSON.stringify(missingMaps, null, 2), 'utf8');
        console.log(`\nMissing maps: ${missingMaps.length}`);
        console.log(`Saved Path: ${missingMapPath}`);
    })
    .catch(error => {
        console.error('Runtime Error:', error.message);
    });
