import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'attachmentType'
})
export class AttachmentTypePipe implements PipeTransform {

  transform(filename: string): 'pictures' | 'documents' | 'videos' {
    if (filename) {
      const extension = filename.split('.').pop()?.toLowerCase() || '';

      const pictureExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
      const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];

      if (pictureExtensions.includes(extension)) {
        return 'pictures';
      }
      if (documentExtensions.includes(extension)) {
        return 'documents';
      }
      if (videoExtensions.includes(extension)) {
        return 'videos';
      }
    }
    return 'documents';
  }
}
