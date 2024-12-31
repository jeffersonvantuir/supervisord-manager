<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241231165702 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE server_groups (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE servers (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, ip_fqdn VARCHAR(255) NOT NULL, ssh_username VARCHAR(255) DEFAULT NULL, ssh_password VARCHAR(255) DEFAULT NULL, supervisor_username VARCHAR(255) DEFAULT NULL, supervisor_password VARCHAR(255) DEFAULT NULL, supervisor_endpoint VARCHAR(255) DEFAULT NULL, enabled TINYINT(1) NOT NULL, server_group INT DEFAULT NULL, INDEX IDX_4F8AF5F7CD4126CC (server_group), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE servers ADD CONSTRAINT FK_4F8AF5F7CD4126CC FOREIGN KEY (server_group) REFERENCES server_groups (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE servers DROP FOREIGN KEY FK_4F8AF5F7CD4126CC');
        $this->addSql('DROP TABLE server_groups');
        $this->addSql('DROP TABLE servers');
    }
}
