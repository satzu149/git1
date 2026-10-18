import requests
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://music.163.com/',
    'Cookie': 'appver=2.0.2; os=pc; __csrf='
}

# 歌单详情 API
url = 'https://music.163.com/api/v6/playlist/detail'
params = {
    'id': '2253341764',
    'n': 100000,
    's': 8
}

try:
    resp = requests.post(url, data=params, headers=headers, timeout=15)
    data = resp.json()
    if data.get('code') == 200 and 'playlist' in data:
        tracks = data['playlist'].get('trackIds', [])
        track_ids = [str(t['id']) for t in tracks[:50]]
        print(f"歌单名称: {data['playlist'].get('name')}")
        print(f"歌曲总数: {len(tracks)}")

        # 批量获取歌曲详情
        url2 = 'https://music.163.com/api/song/detail'
        params2 = {
            'id': ','.join(track_ids),
            'ids': json.dumps([int(i) for i in track_ids])
        }
        resp2 = requests.post(url2, data=params2, headers=headers, timeout=15)
        data2 = resp2.json()
        songs = []
        if 'songs' in data2:
            for s in data2['songs']:
                artists = ' / '.join(a['name'] for a in s.get('artists', []))
                songs.append({
                    'id': s['id'],
                    'name': s['name'],
                    'artist': artists,
                    'album': s.get('album', {}).get('name', ''),
                    'pic': s.get('album', {}).get('picUrl', '')
                })
        with open('static/data/songs.json', 'w', encoding='utf-8') as f:
            json.dump(songs, f, ensure_ascii=False, indent=2)
        print(f"已保存 {len(songs)} 首歌曲到 static/data/songs.json")
        for s in songs[:10]:
            print(f"  - {s['name']} - {s['artist']}")
    else:
        print(f"API 返回失败: code={data.get('code')}")
        print(json.dumps(data, ensure_ascii=False)[:500])
except Exception as e:
    print(f"请求失败: {e}")
