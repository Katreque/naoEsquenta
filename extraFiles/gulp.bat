cd \
cd erp4meExtensao
if exist versoes_liberadas RMDIR versoes_liberadas /S /Q
call gulp build-dev
cd versoes_liberadas
rename * extensaoPogChamp.zip

exit
