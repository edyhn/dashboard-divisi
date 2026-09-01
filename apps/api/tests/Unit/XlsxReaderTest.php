<?php

namespace Tests\Unit;

use App\Exceptions\ApiException;
use App\Services\XlsxReader;
use PHPUnit\Framework\TestCase;
use Tests\Support\XlsxWriter;

class XlsxReaderTest extends TestCase
{
    public function test_membaca_header_dan_baris_data(): void
    {
        $path = sys_get_temp_dir().'/reader-'.uniqid().'.xlsx';
        XlsxWriter::write($path, [
            ['Tanggal', 'Kode Outlet', 'Gross Sales'],
            ['2026-09-01', 'MINI-001', '1000000'],
            ['2026-09-02', 'MINI-001', '1200000'],
        ]);

        $rows = (new XlsxReader)->read($path);

        $this->assertCount(3, $rows);
        $this->assertSame('Kode Outlet', $rows[0][1]);
        $this->assertSame('1200000', $rows[2][2]);
    }

    public function test_baris_kosong_dilewati(): void
    {
        $path = sys_get_temp_dir().'/reader-empty-'.uniqid().'.xlsx';
        XlsxWriter::write($path, [
            ['Tanggal', 'Kode Outlet'],
            ['', ''],
            ['2026-09-01', 'MINI-001'],
        ]);

        $rows = (new XlsxReader)->read($path);

        $this->assertCount(2, $rows);
        $this->assertSame('2026-09-01', $rows[1][0]);
    }

    public function test_file_bukan_xlsx_ditolak(): void
    {
        $path = sys_get_temp_dir().'/bukan-'.uniqid().'.xlsx';
        file_put_contents($path, 'ini bukan spreadsheet');

        $this->expectException(ApiException::class);
        (new XlsxReader)->read($path);
    }
}
