<?php

namespace App\Services;

use App\Exceptions\ApiException;
use SimpleXMLElement;
use ZipArchive;

/**
 * Pembaca .xlsx minimal: xlsx hanyalah zip berisi XML, jadi cukup ZipArchive + SimpleXML.
 * ponytail: hanya sheet pertama, tanpa formula/format sel — cukup untuk template omzet.
 * Naik ke phpoffice/phpspreadsheet bila template butuh formula atau multi-sheet.
 */
class XlsxReader
{
    /**
     * @return array<int, array<int, string>> baris (baris pertama = header)
     */
    public function read(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            throw new ApiException('IMPORT_ROW_INVALID', 'File tidak dapat dibaca sebagai .xlsx');
        }

        $sheetPath = $this->firstSheetPath($zip);
        $sheetXml = $sheetPath ? $zip->getFromName($sheetPath) : false;
        if ($sheetXml === false) {
            $zip->close();
            throw new ApiException('IMPORT_ROW_INVALID', 'Worksheet tidak ditemukan di dalam file .xlsx');
        }

        $shared = $this->sharedStrings($zip);
        $zip->close();

        $sheet = @simplexml_load_string($sheetXml);
        if ($sheet === false) {
            throw new ApiException('IMPORT_ROW_INVALID', 'Struktur worksheet tidak valid');
        }

        $rows = [];
        foreach ($sheet->sheetData->row as $row) {
            $cells = [];
            foreach ($row->c as $cell) {
                $index = $this->columnIndex((string) $cell['r']);
                $cells[$index] = $this->cellValue($cell, $shared);
            }

            if ($cells === []) {
                continue;
            }

            $max = max(array_keys($cells));
            $normalized = [];
            for ($i = 0; $i <= $max; $i++) {
                $normalized[$i] = $cells[$i] ?? '';
            }

            if (implode('', $normalized) === '') {
                continue;
            }

            $rows[] = $normalized;
        }

        return $rows;
    }

    private function firstSheetPath(ZipArchive $zip): ?string
    {
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (str_starts_with($name, 'xl/worksheets/') && str_ends_with($name, '.xml')) {
                return $name;
            }
        }

        return null;
    }

    /** @return array<int, string> */
    private function sharedStrings(ZipArchive $zip): array
    {
        $xml = $zip->getFromName('xl/sharedStrings.xml');
        if ($xml === false) {
            return [];
        }

        $doc = @simplexml_load_string($xml);
        if ($doc === false) {
            return [];
        }

        $strings = [];
        foreach ($doc->si as $si) {
            $strings[] = $this->flattenText($si);
        }

        return $strings;
    }

    private function flattenText(SimpleXMLElement $node): string
    {
        $text = '';
        foreach ($node->xpath('.//*[local-name()="t"]') ?: [] as $t) {
            $text .= (string) $t;
        }

        return $text;
    }

    /** @param array<int, string> $shared */
    private function cellValue(SimpleXMLElement $cell, array $shared): string
    {
        $type = (string) $cell['t'];

        if ($type === 's') {
            $index = (int) $cell->v;

            return $shared[$index] ?? '';
        }

        if ($type === 'inlineStr') {
            return $this->flattenText($cell);
        }

        return trim((string) $cell->v);
    }

    /** A1 -> 0, B2 -> 1, AA1 -> 26 */
    private function columnIndex(string $reference): int
    {
        preg_match('/^([A-Z]+)/', strtoupper($reference), $m);
        $letters = $m[1] ?? 'A';

        $index = 0;
        foreach (str_split($letters) as $letter) {
            $index = $index * 26 + (ord($letter) - 64);
        }

        return $index - 1;
    }
}
